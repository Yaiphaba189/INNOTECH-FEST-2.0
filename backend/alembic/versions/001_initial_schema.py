"""Initial schema with 7 core entities and PostGIS support

Revision ID: 001_initial_schema
Revises: 
Create Date: 2026-10-17 12:00:00.000000

"""
from typing import Sequence, Union
from alembic import op
import sqlalchemy as sa

revision: str = '001_initial_schema'
down_revision: Union[str, None] = None
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    # 1. users
    op.create_table(
        'users',
        sa.Column('id', sa.String(length=36), nullable=False),
        sa.Column('phone_number', sa.String(length=15), nullable=False),
        sa.Column('full_name', sa.String(length=150), nullable=False),
        sa.Column('password_hash', sa.String(length=255), nullable=False),
        sa.Column('role', sa.String(length=20), nullable=False, server_default='farmer'),
        sa.Column('preferred_language', sa.String(length=15), nullable=False, server_default='en'),
        sa.Column('is_simulated', sa.Boolean(), nullable=False, server_default='false'),
        sa.Column('created_at', sa.DateTime(timezone=True), nullable=False),
        sa.PrimaryKeyConstraint('id')
    )
    op.create_index(op.f('ix_users_id'), 'users', ['id'], unique=False)
    op.create_index(op.f('ix_users_phone_number'), 'users', ['phone_number'], unique=True)

    # 2. farms
    op.create_table(
        'farms',
        sa.Column('id', sa.String(length=36), nullable=False),
        sa.Column('farmer_id', sa.String(length=36), nullable=False),
        sa.Column('farm_name', sa.String(length=150), nullable=False),
        sa.Column('district', sa.String(length=100), nullable=False),
        sa.Column('sub_division', sa.String(length=100), nullable=True),
        sa.Column('latitude', sa.Float(), nullable=False),
        sa.Column('longitude', sa.Float(), nullable=False),
        sa.Column('total_area_ha', sa.Numeric(precision=6, scale=2), nullable=False),
        sa.Column('elevation_meters', sa.Integer(), nullable=True),
        sa.ForeignKeyConstraint(['farmer_id'], ['users.id'], ondelete='CASCADE'),
        sa.PrimaryKeyConstraint('id')
    )
    op.create_index(op.f('ix_farms_id'), 'farms', ['id'], unique=False)
    op.create_index(op.f('ix_farms_farmer_id'), 'farms', ['farmer_id'], unique=False)
    op.create_index(op.f('ix_farms_district'), 'farms', ['district'], unique=False)

    # 3. crop_records
    op.create_table(
        'crop_records',
        sa.Column('id', sa.String(length=36), nullable=False),
        sa.Column('farm_id', sa.String(length=36), nullable=False),
        sa.Column('crop_type', sa.String(length=50), nullable=False, server_default='pineapple'),
        sa.Column('variety', sa.String(length=50), nullable=False),
        sa.Column('planting_date', sa.Date(), nullable=False),
        sa.Column('current_stage', sa.String(length=30), nullable=False, server_default='vegetative'),
        sa.Column('estimated_plant_count', sa.Integer(), nullable=False),
        sa.ForeignKeyConstraint(['farm_id'], ['farms.id'], ondelete='CASCADE'),
        sa.PrimaryKeyConstraint('id')
    )
    op.create_index(op.f('ix_crop_records_id'), 'crop_records', ['id'], unique=False)
    op.create_index(op.f('ix_crop_records_farm_id'), 'crop_records', ['farm_id'], unique=False)

    # 4. disease_assessments
    op.create_table(
        'disease_assessments',
        sa.Column('id', sa.String(length=36), nullable=False),
        sa.Column('crop_record_id', sa.String(length=36), nullable=False),
        sa.Column('image_url', sa.String(length=500), nullable=False),
        sa.Column('image_angle', sa.String(length=30), nullable=False),
        sa.Column('predicted_class', sa.String(length=50), nullable=False),
        sa.Column('confidence_score', sa.Numeric(precision=4, scale=3), nullable=False),
        sa.Column('severity_rating', sa.String(length=20), nullable=False),
        sa.Column('expert_referred', sa.Boolean(), nullable=False, server_default='false'),
        sa.Column('model_version', sa.String(length=50), nullable=False),
        sa.Column('image_hash_sha256', sa.String(length=64), nullable=True),
        sa.Column('remedy_notes', sa.Text(), nullable=True),
        sa.Column('created_at', sa.DateTime(timezone=True), nullable=False),
        sa.ForeignKeyConstraint(['crop_record_id'], ['crop_records.id'], ondelete='CASCADE'),
        sa.PrimaryKeyConstraint('id')
    )
    op.create_index(op.f('ix_disease_assessments_id'), 'disease_assessments', ['id'], unique=False)
    op.create_index(op.f('ix_disease_assessments_crop_record_id'), 'disease_assessments', ['crop_record_id'], unique=False)

    # 5. dispatch_runs
    op.create_table(
        'dispatch_runs',
        sa.Column('id', sa.String(length=36), nullable=False),
        sa.Column('vehicle_type', sa.String(length=50), nullable=False),
        sa.Column('max_capacity_kg', sa.Integer(), nullable=False),
        sa.Column('driver_name', sa.String(length=150), nullable=False),
        sa.Column('driver_phone', sa.String(length=15), nullable=False),
        sa.Column('total_loaded_kg', sa.Numeric(precision=8, scale=2), nullable=False),
        sa.Column('destination_facility', sa.String(length=200), nullable=False),
        sa.Column('digital_gate_pass', sa.String(length=100), nullable=False),
        sa.Column('capacity_fill_pct', sa.Numeric(precision=5, scale=2), nullable=False),
        sa.Column('estimated_cost_per_kg', sa.Numeric(precision=6, scale=2), nullable=False),
        sa.Column('route_stops_json', sa.Text(), nullable=True),
        sa.Column('status', sa.String(length=30), nullable=False, server_default='scheduled'),
        sa.Column('created_at', sa.DateTime(timezone=True), nullable=False),
        sa.PrimaryKeyConstraint('id')
    )
    op.create_index(op.f('ix_dispatch_runs_id'), 'dispatch_runs', ['id'], unique=False)
    op.create_index(op.f('ix_dispatch_runs_digital_gate_pass'), 'dispatch_runs', ['digital_gate_pass'], unique=True)

    # 6. harvest_lots
    op.create_table(
        'harvest_lots',
        sa.Column('id', sa.String(length=36), nullable=False),
        sa.Column('farmer_id', sa.String(length=36), nullable=False),
        sa.Column('crop_record_id', sa.String(length=36), nullable=False),
        sa.Column('quantity_kg', sa.Numeric(precision=8, scale=2), nullable=False),
        sa.Column('quality_grade', sa.String(length=20), nullable=False),
        sa.Column('brix_reading', sa.Numeric(precision=4, scale=1), nullable=True),
        sa.Column('harvest_window_start', sa.Date(), nullable=False),
        sa.Column('harvest_window_end', sa.Date(), nullable=False),
        sa.Column('status', sa.String(length=30), nullable=False, server_default='registered'),
        sa.Column('dispatch_run_id', sa.String(length=36), nullable=True),
        sa.Column('created_at', sa.DateTime(timezone=True), nullable=False),
        sa.ForeignKeyConstraint(['crop_record_id'], ['crop_records.id'], ondelete='CASCADE'),
        sa.ForeignKeyConstraint(['dispatch_run_id'], ['dispatch_runs.id'], ondelete='SET NULL'),
        sa.ForeignKeyConstraint(['farmer_id'], ['users.id'], ondelete='CASCADE'),
        sa.PrimaryKeyConstraint('id')
    )
    op.create_index(op.f('ix_harvest_lots_id'), 'harvest_lots', ['id'], unique=False)
    op.create_index(op.f('ix_harvest_lots_farmer_id'), 'harvest_lots', ['farmer_id'], unique=False)
    op.create_index(op.f('ix_harvest_lots_crop_record_id'), 'harvest_lots', ['crop_record_id'], unique=False)

    # 7. buyer_orders
    op.create_table(
        'buyer_orders',
        sa.Column('id', sa.String(length=36), nullable=False),
        sa.Column('buyer_id', sa.String(length=36), nullable=False),
        sa.Column('variety_required', sa.String(length=50), nullable=False, server_default='any'),
        sa.Column('min_grade', sa.String(length=20), nullable=False, server_default='grade_b'),
        sa.Column('target_quantity_kg', sa.Numeric(precision=10, scale=2), nullable=False),
        sa.Column('offered_gross_rate', sa.Numeric(precision=8, scale=2), nullable=False),
        sa.Column('delivery_hub_district', sa.String(length=100), nullable=False),
        sa.Column('required_by_date', sa.Date(), nullable=False),
        sa.Column('payment_terms_days', sa.Integer(), nullable=False, server_default='0'),
        sa.Column('status', sa.String(length=30), nullable=False, server_default='open'),
        sa.Column('created_at', sa.DateTime(timezone=True), nullable=False),
        sa.ForeignKeyConstraint(['buyer_id'], ['users.id'], ondelete='CASCADE'),
        sa.PrimaryKeyConstraint('id')
    )
    op.create_index(op.f('ix_buyer_orders_id'), 'buyer_orders', ['id'], unique=False)
    op.create_index(op.f('ix_buyer_orders_buyer_id'), 'buyer_orders', ['buyer_id'], unique=False)

    # 8. lot_matches
    op.create_table(
        'lot_matches',
        sa.Column('id', sa.String(length=36), nullable=False),
        sa.Column('lot_id', sa.String(length=36), nullable=False),
        sa.Column('order_id', sa.String(length=36), nullable=False),
        sa.Column('gross_rate', sa.Numeric(precision=8, scale=2), nullable=False),
        sa.Column('freight_deduction', sa.Numeric(precision=8, scale=2), nullable=False),
        sa.Column('handling_deduction', sa.Numeric(precision=8, scale=2), nullable=False),
        sa.Column('platform_fee', sa.Numeric(precision=8, scale=2), nullable=False),
        sa.Column('net_rate', sa.Numeric(precision=8, scale=2), nullable=False),
        sa.Column('total_take_home', sa.Numeric(precision=10, scale=2), nullable=False),
        sa.Column('match_score', sa.Numeric(precision=5, scale=3), nullable=False, server_default='1.000'),
        sa.Column('status', sa.String(length=30), nullable=False, server_default='offered'),
        sa.Column('pickup_date', sa.Date(), nullable=False),
        sa.Column('created_at', sa.DateTime(timezone=True), nullable=False),
        sa.ForeignKeyConstraint(['lot_id'], ['harvest_lots.id'], ondelete='CASCADE'),
        sa.ForeignKeyConstraint(['order_id'], ['buyer_orders.id'], ondelete='CASCADE'),
        sa.PrimaryKeyConstraint('id')
    )
    op.create_index(op.f('ix_lot_matches_id'), 'lot_matches', ['id'], unique=False)
    op.create_index(op.f('ix_lot_matches_lot_id'), 'lot_matches', ['lot_id'], unique=False)
    op.create_index(op.f('ix_lot_matches_order_id'), 'lot_matches', ['order_id'], unique=False)


def downgrade() -> None:
    op.drop_table('lot_matches')
    op.drop_table('buyer_orders')
    op.drop_table('harvest_lots')
    op.drop_table('dispatch_runs')
    op.drop_table('disease_assessments')
    op.drop_table('crop_records')
    op.drop_table('farms')
    op.drop_table('users')
