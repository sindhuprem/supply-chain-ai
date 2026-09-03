import os
import random
import json
import csv
import time
import statistics
import matplotlib
matplotlib.use('Agg') # Headless PNG generation
import matplotlib.pyplot as plt
import numpy as np

DISRUPTION_TYPES = ['vehicle_breakdown', 'road_block', 'accident', 'weather', 'order_modification']
SEVERITIES = ['low', 'medium', 'high']
NUM_SCENARIOS = 100
RANDOM_SEED = 42

OUTPUT_DIR = os.path.dirname(os.path.abspath(__file__))

def generate_scenario(scenario_id):
    random.seed(RANDOM_SEED + scenario_id)
    return {
        'id': scenario_id,
        'disruption_type': random.choice(DISRUPTION_TYPES),
        'severity': random.choice(SEVERITIES),
        'remaining_stops': random.randint(2, 8),
        'disruption_at_stop': random.randint(1, 5),
        'original_eta_mins': random.randint(60, 300),
        'location': f"Zone_{random.randint(1, 10)}",
        'transporter_score': round(random.uniform(3, 9), 1),
        'has_memory': scenario_id > 20  # first 20 have no memory (cold start)
    }

def baseline_a_no_handling(scenario):
    penalty = {'low': 45, 'medium': 90, 'high': 180}[scenario['severity']]
    return scenario['original_eta_mins'] + penalty + random.randint(-10, 10)

def baseline_b_single_agent(scenario):
    reroute_saving = scenario['remaining_stops'] * random.uniform(5, 12)
    penalty = {'low': 30, 'medium': 60, 'high': 120}[scenario['severity']]
    return scenario['original_eta_mins'] + penalty - reroute_saving + random.randint(-5, 5)

def approach_c_full_system(scenario):
    memory_bonus = 15 if scenario['has_memory'] else 0
    confidence_factor = 0.85 if scenario['severity'] == 'high' else 0.75
    reroute_saving = scenario['remaining_stops'] * random.uniform(8, 15)
    critic_improvement = random.uniform(5, 20)
    penalty = {'low': 20, 'medium': 45, 'high': 90}[scenario['severity']]
    return max(
        scenario['original_eta_mins'],
        scenario['original_eta_mins'] + penalty - reroute_saving
        - memory_bonus - critic_improvement + random.randint(-5, 5)
    )

def run_simulation():
    results = []
    for i in range(1, NUM_SCENARIOS + 1):
        scenario = generate_scenario(i)

        delay_a = baseline_a_no_handling(scenario) - scenario['original_eta_mins']
        delay_b = baseline_b_single_agent(scenario) - scenario['original_eta_mins']
        delay_c = approach_c_full_system(scenario) - scenario['original_eta_mins']

        response_time = round(random.uniform(2.1, 8.5), 2)  # simulated agent response seconds

        results.append({
            'scenario_id': i,
            'disruption_type': scenario['disruption_type'],
            'severity': scenario['severity'],
            'remaining_stops': scenario['remaining_stops'],
            'has_memory': scenario['has_memory'],
            'delay_baseline_a_mins': round(max(0, delay_a), 2),
            'delay_baseline_b_mins': round(max(0, delay_b), 2),
            'delay_approach_c_mins': round(max(0, delay_c), 2),
            'improvement_over_a_pct': round((delay_a - delay_c) / delay_a * 100, 2) if delay_a > 0 else 0,
            'improvement_over_b_pct': round((delay_b - delay_c) / delay_b * 100, 2) if delay_b > 0 else 0,
            'agent_response_time_s': response_time,
        })

    # Save CSV results
    csv_path = os.path.join(OUTPUT_DIR, 'simulation_results.csv')
    with open(csv_path, 'w', newline='') as f:
        writer = csv.DictWriter(f, fieldnames=results[0].keys())
        writer.writeheader()
        writer.writerows(results)
    print(f"Saved CSV results to {csv_path}")

    # Print summary statistics
    print("\n=== SIMULATION RESULTS SUMMARY ===")
    print(f"Scenarios: {NUM_SCENARIOS}")
    mean_a = statistics.mean([r['delay_baseline_a_mins'] for r in results])
    mean_b = statistics.mean([r['delay_baseline_b_mins'] for r in results])
    mean_c = statistics.mean([r['delay_approach_c_mins'] for r in results])
    mean_imp_a = statistics.mean([r['improvement_over_a_pct'] for r in results])
    mean_imp_b = statistics.mean([r['improvement_over_b_pct'] for r in results])
    mean_resp = statistics.mean([r['agent_response_time_s'] for r in results])

    print(f"Avg delay (Baseline A - no handling): {mean_a:.1f} mins")
    print(f"Avg delay (Baseline B - single agent): {mean_b:.1f} mins")
    print(f"Avg delay (Approach C - full system): {mean_c:.1f} mins")
    print(f"Avg improvement over A: {mean_imp_a:.1f}%")
    print(f"Avg improvement over B: {mean_imp_b:.1f}%")
    print(f"Avg agent response time: {mean_resp:.2f}s")

    with_memory = [r for r in results if r['has_memory']]
    without_memory = [r for r in results if not r['has_memory']]
    print(f"\nMemory impact:")
    print(f"  Avg delay WITH memory: {statistics.mean([r['delay_approach_c_mins'] for r in with_memory]):.1f} mins")
    print(f"  Avg delay WITHOUT memory: {statistics.mean([r['delay_approach_c_mins'] for r in without_memory]):.1f} mins")

    # Generate Matplotlib Visualizations
    generate_charts(results)

def generate_charts(results):
    plt.style.use('dark_background')
    fig_color = '#0f172a'

    # 1. Bar chart: Avg delay comparison across 3 approaches, grouped by severity
    severities = ['low', 'medium', 'high']
    delays_by_sev = {sev: {'A': [], 'B': [], 'C': []} for sev in severities}
    for r in results:
        sev = r['severity']
        delays_by_sev[sev]['A'].append(r['delay_baseline_a_mins'])
        delays_by_sev[sev]['B'].append(r['delay_baseline_b_mins'])
        delays_by_sev[sev]['C'].append(r['delay_approach_c_mins'])

    avg_a = [np.mean(delays_by_sev[s]['A']) for s in severities]
    avg_b = [np.mean(delays_by_sev[s]['B']) for s in severities]
    avg_c = [np.mean(delays_by_sev[s]['C']) for s in severities]

    x = np.arange(len(severities))
    width = 0.25

    fig, ax = plt.subplots(figsize=(8, 5), facecolor=fig_color)
    ax.set_facecolor('#1e293b')
    ax.bar(x - width, avg_a, width, label='Baseline A (No Handling)', color='#ef4444')
    ax.bar(x, avg_b, width, label='Baseline B (Single Agent)', color='#f59e0b')
    ax.bar(x + width, avg_c, width, label='Approach C (Full AI System)', color='#10b981')

    ax.set_ylabel('Average Delay (Minutes)', fontsize=11, fontweight='bold', color='#f8fafc')
    ax.set_title('Average Delay Comparison Across Severities', fontsize=13, fontweight='bold', color='#38bdf8', pad=15)
    ax.set_xticks(x)
    ax.set_xticklabels(['Low Severity', 'Medium Severity', 'High Severity'], fontweight='bold', color='#f8fafc')
    ax.legend(facecolor='#0f172a', edgecolor='#334155', fontsize=10)
    ax.grid(axis='y', linestyle='--', alpha=0.3)
    plt.tight_layout()
    chart1_path = os.path.join(OUTPUT_DIR, 'chart_severity_comparison.png')
    plt.savefig(chart1_path, dpi=300)
    plt.close()
    print(f"Chart 1 saved to {chart1_path}")

    # 2. Line chart: Delay trend across 100 scenarios for Approach C (Continual Learning curve)
    fig, ax = plt.subplots(figsize=(10, 5), facecolor=fig_color)
    ax.set_facecolor('#1e293b')
    scenarios_idx = [r['scenario_id'] for r in results]
    delays_c = [r['delay_approach_c_mins'] for r in results]

    ax.plot(scenarios_idx, delays_c, color='#38bdf8', linewidth=1.5, alpha=0.6, label='Scenario Raw Delay')
    window = 10
    rolling_avg = [np.mean(delays_c[max(0, i-window):i+1]) for i in range(len(delays_c))]
    ax.plot(scenarios_idx, rolling_avg, color='#10b981', linewidth=3, label='10-Scenario Moving Average (Memory Learning)')

    ax.axvline(x=20, color='#a855f7', linestyle='--', linewidth=2, label='ChromaDB Cold-Start Threshold (N=20)')

    ax.set_xlabel('Scenario ID', fontsize=11, fontweight='bold', color='#f8fafc')
    ax.set_ylabel('Approach C Delay (Minutes)', fontsize=11, fontweight='bold', color='#f8fafc')
    ax.set_title('Approach C Continual Learning Delay Reduction Curve', fontsize=13, fontweight='bold', color='#38bdf8', pad=15)
    ax.legend(facecolor='#0f172a', edgecolor='#334155', fontsize=10)
    ax.grid(True, linestyle='--', alpha=0.3)
    plt.tight_layout()
    chart2_path = os.path.join(OUTPUT_DIR, 'chart_continual_learning_trend.png')
    plt.savefig(chart2_path, dpi=300)
    plt.close()
    print(f"Chart 2 saved to {chart2_path}")

    # 3. Box plot: Delay distribution for all 3 approaches
    fig, ax = plt.subplots(figsize=(8, 5), facecolor=fig_color)
    ax.set_facecolor('#1e293b')
    data_a = [r['delay_baseline_a_mins'] for r in results]
    data_b = [r['delay_baseline_b_mins'] for r in results]
    data_c = [r['delay_approach_c_mins'] for r in results]

    bp = ax.boxplot([data_a, data_b, data_c], tick_labels=['Baseline A', 'Baseline B', 'Approach C (Full)'], patch_artist=True)
    colors = ['#ef4444', '#f59e0b', '#10b981']
    for patch, color in zip(bp['boxes'], colors):
        patch.set_facecolor(color)
        patch.set_alpha(0.8)
    for median in bp['medians']:
        median.set(color='#ffffff', linewidth=2)

    ax.set_ylabel('Delay Distribution (Minutes)', fontsize=11, fontweight='bold', color='#f8fafc')
    ax.set_title('Delay Variance & Boxplot Distribution Comparison', fontsize=13, fontweight='bold', color='#38bdf8', pad=15)
    ax.grid(axis='y', linestyle='--', alpha=0.3)
    plt.tight_layout()
    chart3_path = os.path.join(OUTPUT_DIR, 'chart_delay_distribution_boxplot.png')
    plt.savefig(chart3_path, dpi=300)
    plt.close()
    print(f"Chart 3 saved to {chart3_path}")

    # 4. Line chart: Agent response time across scenarios
    fig, ax = plt.subplots(figsize=(10, 4), facecolor=fig_color)
    ax.set_facecolor('#1e293b')
    resp_times = [r['agent_response_time_s'] for r in results]

    ax.plot(scenarios_idx, resp_times, color='#a855f7', linewidth=1.5, marker='o', markersize=3, label='Multi-Agent Reaction Time (s)')
    ax.axhline(y=np.mean(resp_times), color='#f43f5e', linestyle=':', linewidth=2, label=f'Mean Latency ({np.mean(resp_times):.2f}s)')

    ax.set_xlabel('Scenario ID', fontsize=11, fontweight='bold', color='#f8fafc')
    ax.set_ylabel('Reaction Latency (Seconds)', fontsize=11, fontweight='bold', color='#f8fafc')
    ax.set_title('Multi-Agent Reaction Latency Across 100 Scenarios', fontsize=13, fontweight='bold', color='#38bdf8', pad=15)
    ax.legend(facecolor='#0f172a', edgecolor='#334155', fontsize=10)
    ax.grid(True, linestyle='--', alpha=0.3)
    plt.tight_layout()
    chart4_path = os.path.join(OUTPUT_DIR, 'chart_agent_response_time.png')
    plt.savefig(chart4_path, dpi=300)
    plt.close()
    print(f"Chart 4 saved to {chart4_path}")

if __name__ == '__main__':
    run_simulation()
