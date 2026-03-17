"""Create slots table.

Revision ID: 20260317160751
Revises: 20260317160750
Create Date: 2026-03-17 16:07:50
"""
from alembic import op
import sqlalchemy as sa

# revision identifiers, used by Alembic
revision = '20260317160751'
down_revision = '20260317160750'
branch_labels = None
depends_on = None

def upgrade():
    """Create slots table."""
    op.create_table(
        'slots',
        sa.Column('id', sa.Integer(), nullable=False),
        sa.Column('location_id', sa.Integer(), nullable=False),
        sa.Column('date', sa.Date(), nullable=False),
        sa.Column('start_time', sa.Time(), nullable=False),
        sa.Column('end_time', sa.Time(), nullable=False),
        sa.Column('max_bookings', sa.Integer(), nullable=False),
        sa.Column('created_at', sa.DateTime(), server_default=sa.text('now()'), nullable=False),
        sa.Column('updated_at', sa.DateTime(), server_default=sa.text('now()'), nullable=False),
        sa.ForeignKeyConstraint(['location_id'], ['locations.id'], ondelete='CASCADE'),
        sa.PrimaryKeyConstraint('id')
    )
    op.create_index('ix_slots_location_id', 'slots', ['location_id'])
    op.create_index('ix_slots_date', 'slots', ['date'])
    op.create_index('ix_slots_location_date', 'slots', ['location_id', 'date'])

def downgrade():
    """Drop slots table."""
    op.drop_index('ix_slots_location_date', 'slots')
    op.drop_index('ix_slots_date', 'slots')
    op.drop_index('ix_slots_location_id', 'slots')
    op.drop_table('slots')
