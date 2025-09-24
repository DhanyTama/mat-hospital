"""Create patients table

Revision ID: 54623b103237
Revises: 
Create Date: 2025-09-24 12:12:32.616162

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = '54623b103237'
down_revision: Union[str, Sequence[str], None] = None
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    """Upgrade schema."""
    op.create_table(
        'patients',
        sa.Column('id', sa.String(), nullable=False),
        sa.Column('nama', sa.String(), nullable=True),
        sa.Column('tanggal_lahir', sa.DateTime(), nullable=True),
        sa.Column('tanggal_kunjungan', sa.DateTime(), nullable=True),
        sa.Column('diagnosis', sa.String(), nullable=True),
        sa.Column('tindakan', sa.String(), nullable=True),
        sa.Column('dokter', sa.String(), nullable=True),
        sa.PrimaryKeyConstraint('id')
    )


def downgrade() -> None:
    """Downgrade schema."""
    op.drop_table('patients')
