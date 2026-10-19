import asyncio
import os
import sys
from datetime import date, timedelta

# Ensure repo root and backend are in path
BACKEND_DIR = os.path.abspath(os.path.join(os.path.dirname(__file__), ".."))
REPO_ROOT = os.path.abspath(os.path.join(BACKEND_DIR, ".."))
if BACKEND_DIR not in sys.path:
    sys.path.insert(0, BACKEND_DIR)
if REPO_ROOT not in sys.path:
    sys.path.insert(0, REPO_ROOT)

from sqlalchemy import select
from app.db.session import get_session, init_db
from app.core.security import get_password_hash
from app.models.user import User
from app.models.farm import Farm
from app.models.crop import CropRecord
from app.models.lot import HarvestLot
from app.models.order import BuyerOrder
from app.models.assessment import DiseaseAssessment
from app.models.dispatch import DispatchRun
from app.schemas.dispatch import DispatchPlanRequest
from app.services.logistics_service import LogisticsService
from PIL import Image


def create_sample_image(filepath: str, color: tuple = (235, 160, 40)):
    """Creates a sample 224x224 RGB image for testing visual inspection."""
    os.makedirs(os.path.dirname(filepath), exist_ok=True)
    if not os.path.exists(filepath):
        img = Image.new("RGB", (224, 224), color=color)
        img.save(filepath, format="JPEG")


async def seed_all(pregenerate_dispatch: bool = True):
    print("Initializing database tables...")
    await init_db()

    # Generate sample demo images
    sample_dir = os.path.join(REPO_ROOT, "data", "demo", "sample_images")
    sample_img1 = os.path.join(sample_dir, "pineapple_heart_rot_sample.jpg")
    sample_img2 = os.path.join(sample_dir, "pineapple_healthy_sample.jpg")
    create_sample_image(sample_img1, (160, 110, 50))
    create_sample_image(sample_img2, (60, 150, 40))

    async with get_session() as session:
        print("Seeding demonstration participants for Manipur pineapple hubs...")

        # 1. Check if seed data already exists
        res = await session.execute(select(User).where(User.phone_number == "+919862000001"))
        if res.scalars().first():
            print("Demo seed data already exists in database. Skipping duplicate insertion.")
            return

        default_pw = get_password_hash("innotech2026")

        # --- USERS ---
        # Farmer 1: Tombi Singh (Churachandpur)
        farmer1 = User(
            id="usr-farmer-tombi-001",
            phone_number="+919862000001",
            full_name="Tombi Singh",
            password_hash=default_pw,
            role="farmer",
            preferred_language="mn_bengali",
            is_simulated=True
        )

        # Farmer 2: Linthoingambi Devi (Thoubal)
        farmer2 = User(
            id="usr-farmer-linthoi-002",
            phone_number="+919862000002",
            full_name="Linthoingambi Devi",
            password_hash=default_pw,
            role="farmer",
            preferred_language="mn_mayek",
            is_simulated=True
        )

        # Farmer 3: Chaoba Singh (Bishnupur)
        farmer3 = User(
            id="usr-farmer-chaoba-003",
            phone_number="+919862000003",
            full_name="Chaoba Singh",
            password_hash=default_pw,
            role="farmer",
            preferred_language="en",
            is_simulated=True
        )

        # Farmers 4 & 5: further Thoubal growers pooled into the same truck run
        farmer4 = User(
            id="usr-farmer-wangbal-004",
            phone_number="+919862000007",
            full_name="Wangbal Ibotombi",
            password_hash=default_pw,
            role="farmer",
            preferred_language="mn_mayek",
            is_simulated=True
        )

        farmer5 = User(
            id="usr-farmer-yumnam-005",
            phone_number="+919862000008",
            full_name="Yumnam Ibomcha",
            password_hash=default_pw,
            role="farmer",
            preferred_language="en",
            is_simulated=True
        )

        # Buyer 1: Manipur Fruit Processing Co-op (Nilakuthi Food Park, Imphal)
        buyer1 = User(
            id="usr-buyer-nilakuthi-001",
            phone_number="+919862000004",
            full_name="Manipur Fruit Processing Co-op",
            password_hash=default_pw,
            role="buyer",
            preferred_language="en",
            is_simulated=True
        )

        # Buyer 2: Imphal Organic Agro Traders
        buyer2 = User(
            id="usr-buyer-imphal-002",
            phone_number="+919862000005",
            full_name="Imphal Organic Agro Traders",
            password_hash=default_pw,
            role="buyer",
            preferred_language="mn_bengali",
            is_simulated=True
        )

        # FPO Coordinator: Manipur Horticulture Producers Union
        fpo_admin = User(
            id="usr-fpo-coordinator-001",
            phone_number="+919862000006",
            full_name="Rajen Meitei (FPO Coordinator)",
            password_hash=default_pw,
            role="fpo",
            preferred_language="en",
            is_simulated=True
        )

        session.add_all([farmer1, farmer2, farmer3, farmer4, farmer5, buyer1, buyer2, fpo_admin])
        await session.flush()

        # --- FARMS ---
        # Tombi's Hillside Farm in Churachandpur
        farm1 = Farm(
            id="farm-churachandpur-001",
            farmer_id=farmer1.id,
            farm_name="Tombi Hillside Terraced Plantation",
            district="Churachandpur",
            sub_division="Tuibong",
            latitude=24.3335,
            longitude=93.6742,
            total_area_ha=1.80,
            elevation_meters=914
        )

        # Linthoingambi's Farm in Thoubal
        farm2 = Farm(
            id="farm-thoubal-002",
            farmer_id=farmer2.id,
            farm_name="Linthoi Organic Queen Grove",
            district="Thoubal",
            sub_division="Wangbal",
            latitude=24.6321,
            longitude=94.0152,
            total_area_ha=2.20,
            elevation_meters=790
        )

        # Chaoba's Farm in Bishnupur
        farm3 = Farm(
            id="farm-bishnupur-003",
            farmer_id=farmer3.id,
            farm_name="Chaoba Lake-Slope Kew Field",
            district="Bishnupur",
            sub_division="Moirang",
            latitude=24.4982,
            longitude=93.7725,
            total_area_ha=1.50,
            elevation_meters=780
        )

        farm4 = Farm(
            id="farm-thoubal-004",
            farmer_id=farmer4.id,
            farm_name="Wangbal Pineapple Terraces",
            district="Thoubal",
            sub_division="Wangbal",
            latitude=24.6107,
            longitude=94.0431,
            total_area_ha=1.60,
            elevation_meters=802
        )

        farm5 = Farm(
            id="farm-thoubal-005",
            farmer_id=farmer5.id,
            farm_name="Yumnam Collection Orchard",
            district="Thoubal",
            sub_division="Lilong",
            latitude=24.6588,
            longitude=93.9876,
            total_area_ha=2.00,
            elevation_meters=776
        )

        session.add_all([farm1, farm2, farm3, farm4, farm5])
        await session.flush()

        # --- CROPS ---
        today = date.today()
        
        # Crop 1: Queen pineapple at Color-Break stage (vulnerable to upcoming monsoon)
        crop1 = CropRecord(
            id="crop-queen-tombi-001",
            farm_id=farm1.id,
            crop_type="pineapple",
            variety="queen",
            planting_date=today - timedelta(days=465),
            current_stage="color_break",
            estimated_plant_count=24000
        )

        # Crop 2: Queen pineapple at Mature stage (harvest ready)
        crop2 = CropRecord(
            id="crop-queen-linthoi-002",
            farm_id=farm2.id,
            crop_type="pineapple",
            variety="queen",
            planting_date=today - timedelta(days=482),
            current_stage="mature",
            estimated_plant_count=30000
        )

        # Crop 3: Kew pineapple in fruit development
        crop3 = CropRecord(
            id="crop-kew-chaoba-003",
            farm_id=farm3.id,
            crop_type="pineapple",
            variety="kew",
            planting_date=today - timedelta(days=420),
            current_stage="fruit_development",
            estimated_plant_count=18000
        )

        crop4 = CropRecord(
            id="crop-queen-wangbal-004",
            farm_id=farm4.id,
            crop_type="pineapple",
            variety="queen",
            planting_date=today - timedelta(days=478),
            current_stage="mature",
            estimated_plant_count=22000
        )

        crop5 = CropRecord(
            id="crop-queen-yumnam-005",
            farm_id=farm5.id,
            crop_type="pineapple",
            variety="queen",
            planting_date=today - timedelta(days=490),
            current_stage="mature",
            estimated_plant_count=28000
        )

        session.add_all([crop1, crop2, crop3, crop4, crop5])
        await session.flush()

        # --- ASSESSMENTS (Module A baseline) ---
        assess1 = DiseaseAssessment(
            id="assess-heart-rot-001",
            crop_record_id=crop1.id,
            image_url="/data/demo/sample_images/pineapple_heart_rot_sample.jpg",
            image_angle="crown",
            predicted_class="heart_rot",
            confidence_score=0.914,
            severity_rating="moderate",
            expert_referred=False,
            model_version="seed-demo-fixture",
            image_hash_sha256="e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855",
            remedy_notes="Dip slips in Trichoderma viride (10g/L); spray Copper Oxychloride (0.25%) at heart base."
        )
        session.add(assess1)

        # --- BUYER ORDERS (Module C baseline) ---
        # Buyer Order 1: Nilakuthi Food Park seeking 2,000 kg Queen pineapple
        order1 = BuyerOrder(
            id="order-nilakuthi-bulk-001",
            buyer_id=buyer1.id,
            variety_required="queen",
            min_grade="grade_a",
            target_quantity_kg=2000.0,
            offered_gross_rate=28.00,  # ₹28.00 / kg gross
            delivery_hub_district="Imphal East (Nilakuthi)",
            required_by_date=today + timedelta(days=7),
            payment_terms_days=0,  # Instant weighment payment
            status="open"
        )

        # Buyer Order 2: Imphal Organic Traders seeking 1,500 kg Queen/Kew Grade B
        order2 = BuyerOrder(
            id="order-imphal-agro-002",
            buyer_id=buyer2.id,
            variety_required="any",
            min_grade="grade_b",
            target_quantity_kg=1500.0,
            offered_gross_rate=25.50,
            delivery_hub_district="Imphal West",
            required_by_date=today + timedelta(days=10),
            payment_terms_days=7,
            status="open"
        )

        session.add_all([order1, order2])
        await session.flush()

        # --- HARVEST LOTS (Module D consolidation baseline) ---
        # Three Thoubal lots from three growers total 1,950 kg: 78% of a Tata 407 (2,500 kg),
        # above the 75% payload gate, pooled into a dispatch run below.
        lot1 = HarvestLot(
            id="lot-thoubal-linthoi-450",
            farmer_id=farmer2.id,
            crop_record_id=crop2.id,
            quantity_kg=450.0,
            quality_grade="grade_a",
            brix_reading=14.8,
            harvest_window_start=today,
            harvest_window_end=today + timedelta(days=4),
            status="committed"
        )

        lot2 = HarvestLot(
            id="lot-thoubal-wangbal-600",
            farmer_id=farmer4.id,
            crop_record_id=crop4.id,
            quantity_kg=600.0,
            quality_grade="grade_a",
            brix_reading=15.1,
            harvest_window_start=today,
            harvest_window_end=today + timedelta(days=4),
            status="committed"
        )

        lot2_b = HarvestLot(
            id="lot-thoubal-hub-900",
            farmer_id=farmer5.id,
            crop_record_id=crop5.id,
            quantity_kg=900.0,
            quality_grade="grade_a",
            brix_reading=14.9,
            harvest_window_start=today,
            harvest_window_end=today + timedelta(days=4),
            status="committed"
        )

        lot3 = HarvestLot(
            id="lot-chura-tombi-500",
            farmer_id=farmer1.id,
            crop_record_id=crop1.id,
            quantity_kg=500.0,
            quality_grade="grade_a",
            brix_reading=14.5,
            harvest_window_start=today,
            harvest_window_end=today + timedelta(days=4),
            status="committed"
        )

        lot4 = HarvestLot(
            id="lot-chura-tuibong-500",
            farmer_id=farmer1.id,
            crop_record_id=crop1.id,
            quantity_kg=500.0,
            quality_grade="grade_a",
            brix_reading=14.6,
            harvest_window_start=today,
            harvest_window_end=today + timedelta(days=4),
            status="committed"
        )

        session.add_all([lot1, lot2, lot2_b, lot3, lot4])
        await session.commit()

    # Pre-generate the pooled Thoubal truck run so the FPO console opens on a passing 78% load.
    # Tests pass pregenerate_dispatch=False to keep the lots unassigned for their own dispatch calls.
    if pregenerate_dispatch:
        async with get_session() as session:
            await LogisticsService.generate_dispatch_plan(
                session,
                DispatchPlanRequest(
                    cluster_district="Thoubal",
                    vehicle_type="pickup_407",
                    destination_hub="Nilakuthi Food Park Processing Unit",
                    enforce_threshold=True,
                    lot_ids=["lot-thoubal-linthoi-450", "lot-thoubal-wangbal-600", "lot-thoubal-hub-900"],
                ),
            )

    print("=================================================================")
    print("SEEDING COMPLETED SUCCESSFULLY!")
    print("Demo Accounts Created (Password: 'innotech2026'):")
    print(" - Farmer 1 (Churachandpur): +919862000001 (Tombi Singh)")
    print(" - Farmer 2 (Thoubal):        +919862000002 (Linthoingambi Devi)")
    print(" - Farmer 3 (Bishnupur):      +919862000003 (Chaoba Singh)")
    print(" - Wholesale Buyer 1:        +919862000004 (Manipur Fruit Processing Co-op)")
    print(" - Wholesale Buyer 2:        +919862000005 (Imphal Organic Traders)")
    print(" - FPO Coordinator:          +919862000006 (Rajen Meitei)")
    print(" - Farmers 4 & 5 (Thoubal):  +919862000007, +919862000008")
    print("Thoubal truck run ready: 3 lots from 3 growers, 1,950 kg (78% Tata 407 fill)")
    print("=================================================================")


if __name__ == "__main__":
    asyncio.run(seed_all())
