import datetime
import logging
import os
import uuid
from typing import Optional

import boto3
from botocore.exceptions import BotoCoreError, ClientError

from app.config import settings

logger = logging.getLogger("plant_aid.storage")


class StorageService:
    def __init__(self):
        self.upload_dir = settings.UPLOAD_DIR
        os.makedirs(self.upload_dir, exist_ok=True)

        self.use_s3 = bool(
            settings.AWS_ACCESS_KEY_ID
            and settings.AWS_SECRET_ACCESS_KEY
            and settings.S3_BUCKET_NAME
        )
        self.s3_client = None
        if self.use_s3:
            try:
                self.s3_client = boto3.client(
                    "s3",
                    aws_access_key_id=settings.AWS_ACCESS_KEY_ID,
                    aws_secret_access_key=settings.AWS_SECRET_ACCESS_KEY,
                    region_name=settings.AWS_REGION,
                )
            except Exception as e:
                logger.warning(f"S3 client initialization failed, falling back to local storage: {e}")
                self.use_s3 = False

    def upload_image(
        self,
        image_bytes: bytes,
        mime_type: str = "image/jpeg",
        user_id: int = 0,
        frame_id: Optional[str] = None,
    ) -> str:
        """
        Uploads image payload to AWS S3 or fallback to local disk storage.
        Follows hierarchical key pattern: frames/{user_id}/{yyyy}/{mm}/{dd}/{frame_id}.{ext}
        Returns s3_storage_uri string (e.g. s3://... or /uploads/...).
        """
        ext = "png" if "png" in mime_type.lower() else "jpg"
        now = datetime.datetime.now(datetime.timezone.utc)
        yyyy = now.strftime("%Y")
        mm = now.strftime("%m")
        dd = now.strftime("%d")
        fid = frame_id or str(uuid.uuid4())

        # Hierarchical S3 key per Implementation.md §6.2
        object_key = f"frames/{user_id}/{yyyy}/{mm}/{dd}/{fid}.{ext}"

        if self.use_s3 and self.s3_client:
            try:
                self.s3_client.put_object(
                    Bucket=settings.S3_BUCKET_NAME,
                    Key=object_key,
                    Body=image_bytes,
                    ContentType=mime_type,
                    # SSE-S3 at rest for every stored frame (Implementation.md §7, store D4)
                    ServerSideEncryption="AES256",
                )
                return f"s3://{settings.S3_BUCKET_NAME}/{object_key}"
            except (BotoCoreError, ClientError) as e:
                logger.error(f"S3 upload failed for {object_key}, falling back to disk: {e}")
                # Fallback to local storage if AWS S3 fails

        # Local storage fallback with matching directory structure
        local_rel_dir = os.path.join("frames", str(user_id), yyyy, mm, dd)
        target_dir = os.path.join(self.upload_dir, local_rel_dir)
        os.makedirs(target_dir, exist_ok=True)

        local_filename = f"{fid}.{ext}"
        local_file_path = os.path.join(target_dir, local_filename)
        with open(local_file_path, "wb") as f:
            f.write(image_bytes)

        # Standardized POSIX URL for local static file serving
        return f"/uploads/frames/{user_id}/{yyyy}/{mm}/{dd}/{local_filename}"

    def generate_presigned_url(
        self, s3_uri: str, expiration_seconds: Optional[int] = None
    ) -> str:
        """
        Generates a time-limited GET presigned URL for an S3 object (default: 15 min TTL).
        If given a local storage URI (/uploads/...), returns the direct URI.
        """
        exp = expiration_seconds or settings.S3_PRESIGNED_EXPIRATION_SECONDS

        if s3_uri.startswith("s3://"):
            parts = s3_uri[5:].split("/", 1)
            bucket = parts[0]
            key = parts[1] if len(parts) > 1 else ""

            if self.use_s3 and self.s3_client:
                try:
                    return self.s3_client.generate_presigned_url(
                        ClientMethod="get_object",
                        Params={"Bucket": bucket, "Key": key},
                        ExpiresIn=exp,
                    )
                except Exception as e:
                    logger.error(f"Failed to generate presigned URL for {s3_uri}: {e}")

            # Simulated / mock presigned URL for environments without active AWS credentials
            return f"https://{bucket}.s3.{settings.AWS_REGION}.amazonaws.com/{key}?X-Amz-Expires={exp}"

        # Local storage fallback
        return s3_uri

    def delete_object(self, s3_uri: str) -> bool:
        """
        Compensates / removes an object from storage (S3 or local disk).
        Used during transaction rollbacks and history record deletions to avoid orphaned files.
        """
        if not s3_uri:
            return False

        if s3_uri.startswith("s3://"):
            parts = s3_uri[5:].split("/", 1)
            bucket = parts[0]
            key = parts[1] if len(parts) > 1 else ""

            if self.use_s3 and self.s3_client:
                try:
                    self.s3_client.delete_object(Bucket=bucket, Key=key)
                    logger.info(f"Successfully deleted S3 object: {s3_uri}")
                    return True
                except Exception as e:
                    logger.error(f"Failed to delete S3 object {s3_uri}: {e}")
                    return False
            # S3 client not configured or mock
            logger.info(f"Mock S3 object deletion succeeded for: {s3_uri}")
            return True

        if s3_uri.startswith("/uploads/"):
            # Extract path relative to UPLOAD_DIR
            rel_path = s3_uri[len("/uploads/"):].replace("/", os.sep)
            local_file_path = os.path.join(self.upload_dir, rel_path)
            if os.path.exists(local_file_path):
                try:
                    os.remove(local_file_path)
                    logger.info(f"Successfully removed local file: {local_file_path}")
                    return True
                except Exception as e:
                    logger.error(f"Failed to delete local file {local_file_path}: {e}")
                    return False
            logger.warning(f"Local file to delete not found: {local_file_path}")
            return False

        return False


storage_service = StorageService()
