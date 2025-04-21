'use client';
import React, { useState, useEffect, useRef, useCallback } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { Chart, registerables, ChartData, ChartOptions } from 'chart.js';
import { Chart as ChartInstance } from 'chart.js/auto';

Chart.register(...registerables);

interface HealthStatusCount {
    status_type: string;
    status_value: string;
    count: number;
}

interface AgeBracketCount {
    age_bracket: string;
    count: number;
}

interface WeightBracketCount {
    weight_bracket: string;
    count: number;
}

type ChartDataType = HealthStatusCount | AgeBracketCount | WeightBracketCount;

function AdminDashboard() {
    const [symptomCounts, setSymptomCounts] = useState<HealthStatusCount[]>([]);
    const [healthConditionCounts, setHealthConditionCounts] = useState<HealthStatusCount[]>([]);
    const [ageBracketCounts, setAgeBracketCounts] = useState<AgeBracketCount[]>([]);
    const [weightBracketCounts, setWeightBracketCounts] = useState<WeightBracketCount[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const symptomChartRef = useRef<HTMLCanvasElement | null>(null);
    const healthConditionChartRef = useRef<HTMLCanvasElement | null>(null);
    const ageBracketChartRef = useRef<HTMLCanvasElement | null>(null);
    const weightBracketChartRef = useRef<HTMLCanvasElement | null>(null);

    const fetchData = useCallback(async <T extends ChartDataType>(
        url: string,
        setData: (data: T[]) => void,
        errorMessage: string,
        headers?: HeadersInit
    ) => {
        setLoading(true);
        setError(null);
        try {
            const { data: { session }, error: sessionError } = await supabase.auth.getSession();
            if (sessionError || !session) {
                throw new Error('Not authenticated');
            }

            const response = await fetch(url, {
                headers: headers || {
                    'Authorization': `Bearer ${session?.access_token}`,
                },
            });

            if (!response.ok) {
                throw new Error(`HTTP error! Status: ${response.status}`);
            }
            const { data } = await response.json();
            console.log(`Raw API Response Data (${errorMessage}):`, JSON.stringify(data, null, 2));

            if (Array.isArray(data)) {
                setData(data as T[]);
            } else {
                console.error('API response is not an array:', data);
                setError('Invalid data format from API');
                setData([]);
            }
        } catch (e: unknown) {
            if (e instanceof Error) {
                setError(e.message || errorMessage);
            } else {
                console.error('Caught non-Error:', e);
                setError('An unexpected error occurred');
            }
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        async function fetchWithAuth() {
            try {
                const { data: { session }, error: sessionError } = await supabase.auth.getSession();
                if (sessionError || !session) {
                    throw new Error('Not authenticated');
                }

                const headers: HeadersInit = {
                    'Authorization': `Bearer ${session?.access_token}`,
                };

                fetchData<HealthStatusCount>('/api/admin/health-status-counts', (data) => {
                    const symptoms = data.filter((item): item is HealthStatusCount => item.status_type === 'symptom');
                    const healthConditions = data.filter((item): item is HealthStatusCount => item.status_type === 'health_condition');
                    setSymptomCounts(symptoms);
                    setHealthConditionCounts(healthConditions);
                }, 'Failed to fetch health status counts', headers);

                fetchData<AgeBracketCount>('/api/admin/age-bracket-counts', setAgeBracketCounts, 'Failed to fetch age bracket counts', headers);

                fetchData<WeightBracketCount>('/api/admin/weight-bracket-counts', setWeightBracketCounts, 'Failed to fetch weight bracket counts', headers);
            } catch (error) {
                console.error("Error in fetchWithAuth:", error);
                setError("Authentication failed");
                setLoading(false);
            }
        }

        fetchWithAuth();
    }, [fetchData]);

    useEffect(() => {
        let symptomChart: ChartInstance | null = null;
        let healthConditionChart: ChartInstance | null = null;
        let ageBracketChart: ChartInstance | null = null;
        let weightBracketChart: ChartInstance | null = null;

        if (symptomCounts.length > 0 && symptomChartRef.current) {
            symptomChart = renderBarChart(symptomChartRef.current, symptomCounts, 'Symptom Counts');
        }

        if (healthConditionCounts.length > 0 && healthConditionChartRef.current) {
            healthConditionChart = renderBarChart(healthConditionChartRef.current, healthConditionCounts, 'Health Condition Counts');
        }

        if (ageBracketCounts.length > 0 && ageBracketChartRef.current) {
            ageBracketChart = renderLineChart(ageBracketChartRef.current, ageBracketCounts, 'Age Bracket Counts');
        }

        if (weightBracketCounts.length > 0 && weightBracketChartRef.current) {
            weightBracketChart = renderWeightLineChart(weightBracketChartRef.current, weightBracketCounts, 'Weight Bracket Counts');
        }

        return () => {
            if (symptomChart) {
                symptomChart.destroy();
            }
            if (healthConditionChart) {
                healthConditionChart.destroy();
            }
            if (ageBracketChart) {
                ageBracketChart.destroy();
            }
            if (weightBracketChart) {
                weightBracketChart.destroy();
            }
        };
    }, [symptomCounts, healthConditionCounts, ageBracketCounts, weightBracketCounts]);

    const renderBarChart = (
        canvas: HTMLCanvasElement,
        data: HealthStatusCount[],
        title: string
    ): ChartInstance => {
        const labels: string[] = data.map(item => item.status_value);
        const counts: number[] = data.map(item => item.count);

        const chartData: ChartData<'bar', number[], string> = {
            labels: labels,
            datasets: [{
                label: title,
                data: counts,
                backgroundColor: 'rgba(75, 192, 192, 0.6)',
                borderColor: 'rgba(75, 192, 192, 1)',
                borderWidth: 1
            }]
        };

        const chartOptions: ChartOptions<'bar'> = {
            scales: {
                y: {
                    beginAtZero: true
                }
            },
            plugins: {
                title: {
                    display: true,
                    text: title,
                    font: {
                        size: 16
                    }
                },
                legend: {
                    display: false
                }
            }
        };

        const existingChart = Chart.getChart(canvas);
        if (existingChart) {
            existingChart.destroy();
        }

        const newChart = new Chart(canvas, {
            type: 'bar',
            data: chartData,
            options: chartOptions
        });
        return newChart;
    };

    const renderLineChart = (
        canvas: HTMLCanvasElement,
        data: AgeBracketCount[],
        title: string
    ): ChartInstance => {
        const labels: string[] = data.map(item => item.age_bracket);
        const counts: number[] = data.map(item => item.count);

        const chartData: ChartData<'line', number[], string> = {
            labels: labels,
            datasets: [{
                label: title,
                data: counts,
                borderColor: 'rgba(255, 99, 132, 1)',
                borderWidth: 2,
                fill: false,
            }]
        };

        const chartOptions: ChartOptions<'line'> = {
            scales: {
                y: {
                    beginAtZero: true,
                    title: {
                        display: true,
                        text: 'Count'
                    },
                    ticks: {
                        stepSize: 1, // Ensure integer ticks
                    }
                },
                x: {
                    title: {
                        display: true,
                        text: 'Age Bracket'
                    }
                }
            },
            plugins: {
                title: {
                    display: true,
                    text: title,
                    font: {
                        size: 16
                    }
                },
                legend: {
                    display: false
                }
            },
            responsive: true,
            maintainAspectRatio: false,
        };

        const existingChart = Chart.getChart(canvas);
        if (existingChart) {
            existingChart.destroy();
        }

        const newChart = new Chart(canvas, {
            type: 'line',
            data: chartData,
            options: chartOptions
        });
        return newChart;
    };

    const renderWeightLineChart = (
        canvas: HTMLCanvasElement,
        data: WeightBracketCount[],
        title: string
    ): ChartInstance => {
        const labels: string[] = data.map(item => item.weight_bracket);
        const counts: number[] = data.map(item => item.count);

        const chartData: ChartData<'line', number[], string> = {
            labels: labels,
            datasets: [{
                label: title,
                data: counts,
                borderColor: 'rgba(255, 159, 64, 1)',
                borderWidth: 2,
                fill: false,
            }]
        };

        const chartOptions: ChartOptions<'line'> = {
            scales: {
                y: {
                    beginAtZero: true,
                    title: {
                        display: true,
                        text: 'Count'
                    },
                    ticks: {
                        stepSize: 1, // Ensure integer ticks
                    }
                },
                x: {
                    title: {
                        display: true,
                        text: 'Weight Bracket'
                    }
                }
            },
            plugins: {
                title: {
                    display: true,
                    text: title,
                    font: {
                        size: 16
                    }
                },
                legend: {
                    display: false
                }
            },
            responsive: true,
            maintainAspectRatio: false,
        };

        const existingChart = Chart.getChart(canvas);
        if (existingChart) {
            existingChart.destroy();
        }

        const newChart = new Chart(canvas, {
            type: 'line',
            data: chartData,
            options: chartOptions
        });
        return newChart;
    };

    return (
        <div className="p-6 text-gray-600">
            {loading && <div>Loading Health Status Counts...</div>}
            {error && <div>Error: {error}</div>}

            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'stretch' }}>
                {/* Top Row: Age Bracket */}
                <div style={{ width: '100%', marginBottom: '20px', height: '300px', overflow: 'hidden' }}>
                    {ageBracketCounts.length > 0 && (
                        <div style={{ width: '100%', height: '100%' }}>
                            <h2>Age Bracket Counts</h2>
                            <canvas ref={ageBracketChartRef} width="400" height="300" style={{ display: 'block', boxSizing: 'border-box', maxHeight: '100%', maxWidth: '100%' }} />
                        </div>
                    )}
                </div>

                {/* Middle Row: Weight Bracket */}
                <div style={{ width: '100%', marginBottom: '20px', height: '300px', overflow: 'hidden' }}>
                    {weightBracketCounts.length > 0 && (
                        <div style={{ width: '100%', height: '100%' }}>
                            <h2>Weight Bracket Counts</h2>
                            <canvas ref={weightBracketChartRef} width="400" height="300" style={{ display: 'block', boxSizing: 'border-box', maxHeight: '100%', maxWidth: '100%' }} />
                        </div>
                    )}
                </div>

                {/* Bottom Row: Symptom and Health Condition Counts */}
                <div style={{ display: 'flex', flexDirection: 'row', justifyContent: 'space-between', flexWrap: 'wrap' }}>
                    {symptomCounts.length > 0 && (
                        <div style={{ flex: 1, marginRight: '20px', marginBottom: '20px' }}>
                            <h2>Symptom Counts</h2>
                            <canvas ref={symptomChartRef} />
                            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                                <thead>
                                    <tr>
                                        <th style={tableHeaderStyle}>Symptom</th>
                                        <th style={tableHeaderStyle}>Count</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {symptomCounts.map((item) => (
                                        <tr key={item.status_value}>
                                            <td style={tableCellStyle}>{item.status_value}</td>
                                            <td style={tableCellStyle}>{item.count}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}

                    {healthConditionCounts.length > 0 && (
                        <div style={{ flex: 1, marginBottom: '20px' }}>
                            <h2>Health Condition Counts</h2>
                            <canvas ref={healthConditionChartRef} />
                            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                                <thead>
                                    <tr>
                                        <th style={tableHeaderStyle}>Health Condition</th>
                                        <th style={tableHeaderStyle}>Count</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {healthConditionCounts.map((item) => (
                                        <tr key={item.status_value}>
                                            <td style={tableCellStyle}>{item.status_value}</td>
                                            <td style={tableCellStyle}>{item.count}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>
            </div>

            {symptomCounts.length === 0 && healthConditionCounts.length === 0 && ageBracketCounts.length === 0 && weightBracketCounts.length === 0 && !loading && !error && (
                <div>No health status data available.</div>
            )}
        </div>
    );
}

const tableHeaderStyle: React.CSSProperties = {
    backgroundColor: '#f0f0f0',
    padding: '8px',
    textAlign: 'left',
    borderBottom: '1px solid #ddd',
};

const tableCellStyle: React.CSSProperties = {
    padding: '8px',
    borderBottom: '1px solid #ddd',
};

export default AdminDashboard;