"""add soft delete column to history log

Revision ID: c3a7f21d84be
Revises: b7c41e9a2f03
Create Date: 2026-09-28 01:52:00.000000

"""

from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = "c3a7f21d84be"
down_revision: Union[str, Sequence[str], None] = "b7c41e9a2f03"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    """Upgrade schema."""
    with op.batch_alter_table("disease_history_logs", schema=None) as batch_op:
        batch_op.add_column(sa.Column("deleted_at", sa.DateTime(), nullable=True))


def downgrade() -> None:
    """Downgrade schema."""
    with op.batch_alter_table("disease_history_logs", schema=None) as batch_op:
        batch_op.drop_column("deleted_at")
