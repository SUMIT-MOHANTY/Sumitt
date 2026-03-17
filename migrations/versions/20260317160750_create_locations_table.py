"""Create locations table.

Revision ID: 20260317160750
Revises:
Create Date: 2026-03-17 16:07:50
"""
from alembic import op
import sqlalchemy as sa

# revision identifiers, used by Alembic
revision = '20260317160750'
down_revision = None
branch_labels = None
depends_on = None

def upgrade():
    """Create locations table."""
    op.create_table(
        'locations',
        sa.Column('id', sa.Integer(), nullable=False),
        sa.Column('name', sa.String(255), nullable=False),
        sa.Column('address', sa.String(500), nullable=False),
        sa.Column('capacity', sa.Integer(), nullable=False),
        sa.Column('is_active', sa.Boolean(), server_default='true', nullable=False),
        sa.Column('created_at', sa.DateTime(), server_default=sa.text('now()'), nullable=False),
        sa.Column('updated_at', sa.DateTime(), server_default=sa.text('now()'), nullable=False),
        sa.PrimaryKeyConstraint('id')
    )
    op.create_index('ix_locations_name', 'locations', ['name'])

def downgrade():
    """Drop locations table."""
    op.drop_index('ix_locations_name', 'locations')
    op.drop_table('locations')
