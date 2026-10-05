"""add_otp_resend_count_to_users

Revision ID: ff9702cbb7fd
Revises: c3a7f21d84be
Create Date: 2026-10-05 09:07:53.324059

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = 'ff9702cbb7fd'
down_revision: Union[str, Sequence[str], None] = 'c3a7f21d84be'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    """Upgrade schema."""
    with op.batch_alter_table("users", schema=None) as batch_op:
        batch_op.add_column(
            sa.Column("otp_resend_count", sa.Integer(), nullable=False, server_default="0")
        )


def downgrade() -> None:
    """Downgrade schema."""
    with op.batch_alter_table("users", schema=None) as batch_op:
        batch_op.drop_column("otp_resend_count")
