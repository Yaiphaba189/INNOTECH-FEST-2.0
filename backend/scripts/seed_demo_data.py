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
from PIL import Image


def create_sample_image(filepath: str, color: tuple = (235, 160, 40)):
    """Creates a sample 224x224 RGB image for testing visual inspection."""
    os.makedirs(os.path.dirname(filepath), exist_ok=True)
    if not os.path.exists(filepath):
        img = Image.new("RGB", (224, 224), color=color)
        img.save(filepath, format="JPEG")


async def seed_all():
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

        session.add_all([farmer1, farmer2, farmer3, buyer1, buyer2, fpo_admin])
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

        session.add_all([farm1, farm2, farm3])
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

        session.add_all([crop1, crop2, crop3])
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
            model_version="pineapple-mobilenet-v1.2",
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
        # 4 Farm lots in Thoubal/Churachandpur cluster totaling 2,050 kg
        # (Optimal for Tata 407 LCV capacity of 2,500 kg -> 82.0% payload saturation!)
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
            farmer_id=farmer2.id,
            crop_record_id=crop2.id,
            quantity_kg=600.0,
            quality_grade="grade_a",
            brix_reading=15.1,
            harvest_window_start=today,
            harvest_window_end=today + timedelta(days=4),
            status="committed"
        )

        lot2_b = HarvestLot(
            id="lot-thoubal-hub-900",
            farmer_id=farmer2.id,
            crop_record_id=crop2.id,
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

        print("=================================================================")
        print("SEEDING COMPLETED SUCCESSFULLY!")
        print("Demo Accounts Created (Password: 'innotech2026'):")
        print(" - Farmer 1 (Churachandpur): +919862000001 (Tombi Singh)")
        print(" - Farmer 2 (Thoubal):        +919862000002 (Linthoingambi Devi)")
        print(" - Farmer 3 (Bishnupur):      +919862000003 (Chaoba Singh)")
        print(" - Wholesale Buyer 1:        +919862000004 (Manipur Fruit Processing Co-op)")
        print(" - Wholesale Buyer 2:        +919862000005 (Imphal Organic Traders)")
        print(" - FPO Coordinator:          +919862000006 (Rajen Meitei)")
        print("Consolidation cluster ready: 4 lots totaling 2,050 kg (82% Tata 407 fill)")
        print("=================================================================")


if __name__ == "__main__":
    asyncio.run(seed_all())
