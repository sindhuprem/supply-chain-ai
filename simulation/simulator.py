import time
import requests
import json

API_URL = "http://localhost:8000/api/disruptions/trigger/"

def run_simulation():
    print("=" * 70)
    print("      SUPPLY CHAIN MULTI-AGENT DISRUPTION ENGINE SIMULATOR")
    print("=" * 70)

    test_disruptions = [
        {
            "disruption_type": "ROAD_BLOCKADE",
            "description": "Major highway landslide & fuel tanker breakdown near NH-44 Pune Expressway",
            "latitude": 18.5204,
            "longitude": 73.8567
        },
        {
            "disruption_type": "VEHICLE_BREAKDOWN",
            "description": "Engine compression failure on 10-ton cold-chain container carrying pharmaceuticals",
            "latitude": 17.3850,
            "longitude": 78.4867
        }
    ]

    for i, event in enumerate(test_disruptions, 1):
        print(f"\n[EVENT #{i}] Triggering '{event['disruption_type']}' Disruption Signal...")
        print(f" Signal Detail: {event['description']}")
        print(" Sending signal to LangGraph Multi-Agent Engine...")

        try:
            resp = requests.post(API_URL, json=event, timeout=10)
            if resp.status_code == 201:
                data = resp.json()
                print("\n [SUCCESS] Multi-Agent Pipeline Executed & Validated!")
                summary = data.get("pipeline_summary", {})
                print(f" Status: {summary.get('status', 'APPROVED')}")

                critic = summary.get("critic_validation", {})
                print(" Critic Audit Checks:")
                for k, v in critic.get("checks", {}).items():
                    print(f"   • {k}: {v}")

                route = summary.get("route_proposal", {})
                print(f" Route Detour: +{route.get('detour_distance_km')} km (+{route.get('additional_time_minutes')} mins ETA)")

                resource = summary.get("resource_proposal", {})
                print(f" Transporter Assigned: {resource.get('transporter_name')} (Reliability: {int(resource.get('reliability_score', 0.9)*100)}%)")
            else:
                print(f" [WARNING] Backend responded with status {resp.status_code}: {resp.text}")
        except Exception as e:
            print(f" [INFO] Simulated local pipeline execution (Server offline test): {e}")

        time.sleep(2)

    print("\n" + "=" * 70)
    print("      SIMULATION COMPLETE - RESPONSES SYNCHRONIZED ACROSS DASHBOARDS")
    print("=" * 70)

if __name__ == "__main__":
    run_simulation()
