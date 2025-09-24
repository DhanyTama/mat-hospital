"""Change patient id to integer autoincrement

Revision ID: 6ba3e34457b0
Revises: ad2b3f0bb8cc
Create Date: 2025-09-24 18:10:10.809530

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = '6ba3e34457b0'
down_revision: Union[str, Sequence[str], None] = 'ad2b3f0bb8cc'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    """Upgrade schema."""
    op.drop_table("patients")

    op.create_table(
        "patients",
        sa.Column("id", sa.Integer(), primary_key=True, autoincrement=True),
        sa.Column("nama", sa.String(), nullable=True),
        sa.Column("tanggal_lahir", sa.DateTime(), nullable=True),
        sa.Column("tanggal_kunjungan", sa.DateTime(), nullable=True),
        sa.Column("diagnosis", sa.String(), nullable=True),
        sa.Column("tindakan", sa.String(), nullable=True),
        sa.Column("dokter", sa.String(), nullable=True),
    )


def downgrade() -> None:
    """Downgrade schema."""
    op.drop_table("patients")

    op.create_table(
        "patients",
        sa.Column("id", sa.String(), primary_key=True),
        sa.Column("nama", sa.String(), nullable=True),
        sa.Column("tanggal_lahir", sa.DateTime(), nullable=True),
        sa.Column("tanggal_kunjungan", sa.DateTime(), nullable=True),
        sa.Column("diagnosis", sa.String(), nullable=True),
        sa.Column("tindakan", sa.String(), nullable=True),
        sa.Column("dokter", sa.String(), nullable=True),
    )
