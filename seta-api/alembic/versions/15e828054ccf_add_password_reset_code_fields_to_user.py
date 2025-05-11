"""add_password_reset_code_fields_to_user

Revision ID: 15e828054ccf
Revises: 7c214517dd0f
Create Date: 2025-05-11 17:34:16.685461

"""

from typing import Sequence, Union

import sqlalchemy as sa

from alembic import op

# revision identifiers, used by Alembic.
revision: str = "15e828054ccf"
down_revision: Union[str, None] = "7c214517dd0f"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    """Upgrade schema."""
    op.add_column("users", sa.Column("password_reset_code", sa.String(), nullable=True))
    op.add_column(
        "users",
        sa.Column(
            "password_reset_code_expiry", sa.DateTime(timezone=True), nullable=True
        ),
    )
    op.create_index(
        op.f("ix_users_password_reset_code"),
        "users",
        ["password_reset_code"],
        unique=False,
    )  # Index can be non-unique if codes are short-lived
    pass


def downgrade() -> None:
    """Downgrade schema."""
    op.drop_index(op.f("ix_users_password_reset_code"), table_name="users")
    op.drop_column("users", "password_reset_code_expiry")
    op.drop_column("users", "password_reset_code")
    pass
