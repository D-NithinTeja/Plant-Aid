import datetime
import os
import uuid

import boto3
from botocore.exceptions import BotoCoreError, ClientError

from app.config import settings


class StorageService:
    def __init__(self):
        self.upload_dir = settings.UPLOAD_DIR
        os.makedirs(self.upload_dir, exist_ok=True)

        self.use_s3 = bool(
            settings.AWS_ACCESS_KEY_ID
            and settings.AWS_SECRET_ACCESS_KEY
            and settings.S3_BUCKET_NAME
        )
        if self.use_s3:
            try:
                self.s3_client = boto3.client(
                    "s3",
                    aws_access_key_id=settings.AWS_ACCESS_KEY_ID,
                    aws_secret_access_key=settings.AWS_SECRET_ACCESS_KEY,
                    region_name=settings.AWS_REGION,
                )
            except Exception:
                self.use_s3 = False

    def upload_image(
        self, image_bytes: bytes, mime_type: str = "image/jpeg", user_id: int = 0
    ) -> str:
        """
        Uploads image payload to AWS S3 or fallback to local disk storage.
        Returns s3_storage_uri string.
        """
        ext = "png" if "png" in mime_type.lower() else "jpg"
        timestamp_str = datetime.datetime.now(datetime.timezone.utc).strftime(
            "%Y%m%d_%H%M%S"
        )
        unique_filename = f"user_{user_id}_{timestamp_str}_{uuid.uuid4().hex[:8]}.{ext}"
        object_key = f"diagnoses/{timestamp_str[:6]}/{unique_filename}"

        if self.use_s3:
            try:
                self.s3_client.put_object(
                    Bucket=settings.S3_BUCKET_NAME,
                    Key=object_key,
                    Body=image_bytes,
                    ContentType=mime_type,
                )
                return f"s3://{settings.S3_BUCKET_NAME}/{object_key}"
            except (BotoCoreError, ClientError):
                # Fallback to local storage if AWS S3 fails
                pass

        # Local storage fallback
        local_file_path = os.path.join(self.upload_dir, unique_filename)
        with open(local_file_path, "wb") as f:
            f.write(image_bytes)

        return f"/uploads/{unique_filename}"


storage_service = StorageService()
