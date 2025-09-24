"""Add role column to users

Revision ID: 2056cf200b03
Revises: 6ba3e34457b0
Create Date: 2025-09-24 18:22:08.008991

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = '2056cf200b03'
down_revision: Union[str, Sequence[str], None] = '6ba3e34457b0'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    """Upgrade schema."""
    op.add_column('users', sa.Column('role', sa.String(), nullable=False, server_default='admin'))


def downgrade() -> None:
    """Downgrade schema."""
    op.drop_column('users', 'role')
