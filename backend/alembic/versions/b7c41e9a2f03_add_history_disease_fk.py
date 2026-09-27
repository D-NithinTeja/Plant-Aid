"""add disease foreign key to history log

Revision ID: b7c41e9a2f03
Revises: 921892d5aaf7
Create Date: 2026-09-28 01:45:00.000000

"""

from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = "b7c41e9a2f03"
down_revision: Union[str, Sequence[str], None] = "921892d5aaf7"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None

_FK_NAME = "fk_disease_history_logs_disease_id"


def _normalize_numeric_disease_keys(connection) -> None:
    """Rewrite legacy numeric disease keys ("1") to the canonical slug stored in D2."""
    diseases = sa.table(
        "diseases", sa.column("id", sa.String), sa.column("numeric_id", sa.Integer)
    )
    logs = sa.table(
        "disease_history_logs",
        sa.column("id", sa.Integer),
        sa.column("disease_id", sa.String),
    )

    numeric_map = {
        str(numeric_id): disease_id
        for disease_id, numeric_id in connection.execute(
            sa.select(diseases.c.id, diseases.c.numeric_id)
        ).fetchall()
        if numeric_id is not None
    }
    if not numeric_map:
        return

    for log_id, disease_id in connection.execute(
        sa.select(logs.c.id, logs.c.disease_id)
    ).fetchall():
        replacement = numeric_map.get(str(disease_id))
        if replacement and replacement != disease_id:
            connection.execute(
                logs.update().where(logs.c.id == log_id).values(disease_id=replacement)
            )


def upgrade() -> None:
    """Upgrade schema."""
    _normalize_numeric_disease_keys(op.get_bind())

    with op.batch_alter_table("disease_history_logs", schema=None) as batch_op:
        batch_op.create_foreign_key(
            _FK_NAME, "diseases", ["disease_id"], ["id"]
        )


def downgrade() -> None:
    """Downgrade schema."""
    with op.batch_alter_table("disease_history_logs", schema=None) as batch_op:
        batch_op.drop_constraint(_FK_NAME, type_="foreignkey")
