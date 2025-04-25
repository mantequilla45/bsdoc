/* eslint-disable @typescript-eslint/no-unused-vars */
'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { supabase } from '@/lib/supabaseClient'; // Adjust path if necessary
import { Chart, registerables, ChartData, ChartOptions } from 'chart.js';
import { Chart as ChartInstance } from 'chart.js/auto';

// Register Chart.js components
Chart.register(...registerables);

// --- Interfaces ---
interface HealthStatusCount {
    status_type: string;
    status_value: string; // Property definitions should be correct
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

// --- Type Alias ---
type ChartDataType = HealthStatusCount | AgeBracketCount | WeightBracketCount;

// --- Helper Function for Formatting Labels ---
const formatLabel = (label: string | null | undefined): string => {
    if (!label) {
        return '';
    }
    // Replace underscores with spaces and convert to lowercase
    return label.replace(/_/g, ' ').toLowerCase();
};
// --- End Helper Function ---

function AdminDashboard() {
    // --- State Variables ---
    const [symptomCounts, setSymptomCounts] = useState<HealthStatusCount[]>([]);
    const [healthConditionCounts, setHealthConditionCounts] = useState<HealthStatusCount[]>([]);
    const [ageBracketCounts, setAgeBracketCounts] = useState<AgeBracketCount[]>([]);
    const [weightBracketCounts, setWeightBracketCounts] = useState<WeightBracketCount[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    // --- Refs for Chart Canvases ---
    const symptomChartRef = useRef<HTMLCanvasElement | null>(null);
    const healthConditionChartRef = useRef<HTMLCanvasElement | null>(null);
    const ageBracketChartRef = useRef<HTMLCanvasElement | null>(null);
    const weightBracketChartRef = useRef<HTMLCanvasElement | null>(null);

    // --- Data Fetching Function ---
    const fetchData = useCallback(async <T extends ChartDataType>(
        url: string,
        setData: (data: T[]) => void,
        errorMessage: string,
        headers?: HeadersInit
    ) => {
        // Reset specific loading/error? Maybe keep global for simplicity now.
        // setLoading(true); // Handled in fetchWithAuth
        // setError(null); // Handled in fetchWithAuth
        try {
            const { data: { session }, error: sessionError } = await supabase.auth.getSession();
            if (sessionError || !session) throw new Error('Not authenticated');

            const response = await fetch(url, {
                headers: headers || { 'Authorization': `Bearer ${session.access_token}` },
            });

            if (!response.ok) {
                 const errorBody = await response.text();
                 console.error(`HTTP error for ${url}: ${response.status}`, errorBody);
                 throw new Error(`HTTP error! Status: ${response.status} for ${url}`);
            }
            // Expecting { data: [...] } structure based on previous logs
            const responseJson = await response.json();
            const apiData = responseJson.data; // Extract data array

            if (Array.isArray(apiData)) {
                setData(apiData as T[]);
            } else {
                console.error(`API response data for ${url} is not an array:`, apiData);
                throw new Error(`Invalid data format from API for ${url}`);
            }
        } catch (e: unknown) {
             // Re-throw specific errors to be caught by fetchWithAuth
             if (e instanceof Error) {
                console.error(`Error fetching ${url}:`, e);
                throw new Error(e.message || errorMessage);
             } else {
                console.error(`Unknown error fetching ${url}:`, e);
                throw new Error('An unexpected error occurred during fetch.');
             }
             // setData([]); // Let the caller handle clearing data on error
        }
        // setLoading(false); // Handled in fetchWithAuth
    }, []); // Empty dependency array for useCallback

    // --- useEffect for Initial Data Fetch ---
    useEffect(() => {
        let isMounted = true; // Prevent state updates on unmounted component

        async function fetchWithAuth() {
             if (!isMounted) return; // Exit if component unmounted
             setLoading(true);
             setError(null);
             // Clear previous data on new fetch attempt
             setSymptomCounts([]);
             setHealthConditionCounts([]);
             setAgeBracketCounts([]);
             setWeightBracketCounts([]);

            try {
                const { data: { session }, error: sessionError } = await supabase.auth.getSession();
                if (sessionError || !session) throw new Error('Not authenticated');
                const headers: HeadersInit = { 'Authorization': `Bearer ${session.access_token}` };

                // Use Promise.all to fetch concurrently
                await Promise.all([
                    fetchData<HealthStatusCount>('/api/admin/health-status-counts', (data) => {
                        if (!isMounted) return;
                        const symptoms = data.filter(item => item.status_type === 'symptom');
                        const healthConditions = data.filter(item => item.status_type === 'health_condition');
                        setSymptomCounts(symptoms);
                        setHealthConditionCounts(healthConditions);
                    }, 'Failed to fetch health status counts', headers),

                    fetchData<AgeBracketCount>('/api/admin/age-bracket-counts', (data) => {
                         if (!isMounted) return;
                         setAgeBracketCounts(data);
                    }, 'Failed to fetch age bracket counts', headers),

                    fetchData<WeightBracketCount>('/api/admin/weight-bracket-counts', (data) => {
                         if (!isMounted) return;
                         setWeightBracketCounts(data);
                    }, 'Failed to fetch weight bracket counts', headers)
                ]);

            } catch (error) {
                if (isMounted) {
                    console.error("Error during data fetching:", error);
                    const message = error instanceof Error ? error.message : "Data fetching failed";
                    setError(message);
                    // Ensure data arrays are empty on error
                    setSymptomCounts([]);
                    setHealthConditionCounts([]);
                    setAgeBracketCounts([]);
                    setWeightBracketCounts([]);
                }
            } finally {
                 if (isMounted) {
                    setLoading(false);
                 }
            }
        }

        fetchWithAuth();

        return () => {
            isMounted = false; // Cleanup function to set isMounted to false
        };
    }, [fetchData]); // Include fetchData in dependency array

    // --- useEffect for Chart Rendering & Cleanup ---
    useEffect(() => {
        const chartInstances: { [key: string]: ChartInstance | null } = {
            symptom: null,
            healthCondition: null,
            ageBracket: null,
            weightBracket: null
        };

        const destroyChart = (canvas: HTMLCanvasElement | null) => {
            if (canvas) {
                const existingChart = Chart.getChart(canvas);
                if (existingChart) {
                    existingChart.destroy();
                }
            }
        };

        // Render or destroy charts based on data availability
        if (symptomCounts.length > 0 && symptomChartRef.current) {
            chartInstances.symptom = renderBarChart(symptomChartRef.current, symptomCounts, 'Symptom Counts');
        } else {
            destroyChart(symptomChartRef.current);
        }

        if (healthConditionCounts.length > 0 && healthConditionChartRef.current) {
            chartInstances.healthCondition = renderBarChart(healthConditionChartRef.current, healthConditionCounts, 'Health Condition Counts');
        } else {
             destroyChart(healthConditionChartRef.current);
        }

        if (ageBracketCounts.length > 0 && ageBracketChartRef.current) {
            chartInstances.ageBracket = renderLineChart(ageBracketChartRef.current, ageBracketCounts, 'User Age Distribution');
        } else {
             destroyChart(ageBracketChartRef.current);
        }

        if (weightBracketCounts.length > 0 && weightBracketChartRef.current) {
            chartInstances.weightBracket = renderWeightLineChart(weightBracketChartRef.current, weightBracketCounts, 'User Weight Distribution');
        } else {
             destroyChart(weightBracketChartRef.current);
        }

        // Cleanup function: destroy all created charts
        return () => {
            Object.values(chartInstances).forEach(chart => {
                 if (chart) {
                    chart.destroy();
                 }
            });
        };
        // Rerun effect if any data array changes
    }, [symptomCounts, healthConditionCounts, ageBracketCounts, weightBracketCounts]);


    // --- Chart Rendering Functions ---
    const renderBarChart = (
        canvas: HTMLCanvasElement,
        data: HealthStatusCount[], // Ensure type is correct
        title: string
    ): ChartInstance => {
        // Access properties using correct names from the interface
        const labels: string[] = data.map(item => formatLabel(item.status_value));
        const counts: number[] = data.map(item => item.count);

        const chartData: ChartData<'bar', number[], string> = {
            labels: labels,
            datasets: [{
                label: title.replace(' Counts', ''), // Cleaner label for dataset
                data: counts,
                backgroundColor: 'rgba(54, 162, 235, 0.6)', // Blue
                borderColor: 'rgba(54, 162, 235, 1)',
                borderWidth: 1
            }]
        };
        const chartOptions: ChartOptions<'bar'> = {
             scales: {
                 y: { beginAtZero: true, ticks: { stepSize: 1, precision: 0 } }, // Ensure integer ticks
                 x: { ticks: { autoSkip: false, maxRotation: 70, minRotation: 0 } } // Adjust rotation for long labels
                },
             plugins: {
                title: { display: false }, // Title is handled by surrounding div
                legend: { display: false }
            },
             responsive: true,
             maintainAspectRatio: false // Important for sizing within container
        };

        // Destroy existing chart on the canvas before creating new one
        const existingChart = Chart.getChart(canvas);
        if (existingChart) {
            existingChart.destroy();
        }
        return new Chart(canvas, { type: 'bar', data: chartData, options: chartOptions });
    };

    const renderLineChart = (
        canvas: HTMLCanvasElement,
        data: AgeBracketCount[],
        title: string // Title here is for dataset label, not chart title
    ): ChartInstance => {
        const labels: string[] = data.map(item => formatLabel(item.age_bracket));
        const counts: number[] = data.map(item => item.count);
        const chartData: ChartData<'line', number[], string> = {
            labels: labels,
            datasets: [{
                label: 'Users', // Simple dataset label
                data: counts,
                borderColor: 'rgba(255, 99, 132, 1)', // Red
                backgroundColor: 'rgba(255, 99, 132, 0.2)',
                borderWidth: 2,
                fill: true, // Optional: fill area under line
                tension: 0.1 // Optional: smooth line
             }]
        };
        const chartOptions: ChartOptions<'line'> = {
             scales: {
                 y: { beginAtZero: true, title: { display: true, text: 'Number of Users' }, ticks: { stepSize: 1, precision: 0 } },
                 x: { title: { display: true, text: 'Age Bracket' } }
             },
             plugins: {
                title: { display: false }, // Title is handled by surrounding div
                legend: { display: false }
             },
             responsive: true,
             maintainAspectRatio: false
        };
        const existingChart = Chart.getChart(canvas);
        if (existingChart) existingChart.destroy();
        return new Chart(canvas, { type: 'line', data: chartData, options: chartOptions });
    };

     const renderWeightLineChart = (
        canvas: HTMLCanvasElement,
        data: WeightBracketCount[],
        title: string // Title here is for dataset label
    ): ChartInstance => {
        const labels: string[] = data.map(item => formatLabel(item.weight_bracket));
        const counts: number[] = data.map(item => item.count);
         const chartData: ChartData<'line', number[], string> = {
             labels: labels,
             datasets: [{
                label: 'Users', // Simple dataset label
                data: counts,
                borderColor: 'rgba(75, 192, 192, 1)', // Teal
                backgroundColor: 'rgba(75, 192, 192, 0.2)',
                borderWidth: 2,
                fill: true,
                tension: 0.1
             }]
         };
         const chartOptions: ChartOptions<'line'> = {
             scales: {
                y: { beginAtZero: true, title: { display: true, text: 'Number of Users' }, ticks: { stepSize: 1, precision: 0 } },
                x: { title: { display: true, text: 'Weight Bracket (kg)' } }
             },
             plugins: {
                title: { display: false }, // Title is handled by surrounding div
                legend: { display: false }
             },
             responsive: true,
             maintainAspectRatio: false
         };
         const existingChart = Chart.getChart(canvas);
         if (existingChart) existingChart.destroy();
         return new Chart(canvas, { type: 'line', data: chartData, options: chartOptions });
     };

    // --- Style Definitions ---
    const tableHeaderStyle: React.CSSProperties = {
        backgroundColor: '#f3f4f6', // Tailwind gray-100
        padding: '10px 12px', // Increased padding
        textAlign: 'left',
        borderBottom: '2px solid #e5e7eb', // Heavier border
        fontWeight: 600,
        fontSize: '0.875rem',
        textTransform: 'capitalize',
        position: 'sticky', // Make header sticky within scrollable container
        top: 0, // Stick to the top
        zIndex: 1 // Ensure header is above table rows
    };

    const tableCellStyle: React.CSSProperties = {
        padding: '10px 12px', // Increased padding
        borderBottom: '1px solid #e5e7eb',
        fontSize: '0.875rem',
        textTransform: 'capitalize',
        whiteSpace: 'nowrap' // Prevent wrapping for consistency
    };

    // --- Component Return JSX ---
    return (
        <div className="p-4 md:p-6 bg-gray-100 min-h-screen">
            <h1 className="text-2xl font-semibold text-gray-800 mb-6"></h1>

            {/* Loading State Indicator */}
            {loading && (
                 <div className="fixed inset-0 bg-white bg-opacity-75 flex items-center justify-center z-50">
                     <div className="text-center">
                        <svg className="animate-spin h-8 w-8 text-blue-600 mx-auto mb-2" /* ... SVG path ... */ viewBox="0 0 24 24">
                             <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                             <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                         </svg>
                         <p className="text-lg font-medium text-gray-700">Loading Dashboard Data...</p>
                     </div>
                 </div>
            )}

            {/* Error Message Display */}
            {error && !loading && (
                <div className="mb-6 p-4 text-red-800 border border-red-300 bg-red-100 rounded-lg shadow-sm" role="alert">
                    <strong className="font-semibold">Error:</strong> {error}
                </div>
            )}

            {/* Main Content Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

                {/* Age Bracket Chart Card */}
                <div className="lg:col-span-2 bg-white p-4 rounded-lg shadow-md" style={{ minHeight: '380px' }}>
                    <h2 className="text-lg font-semibold mb-3 text-gray-700 border-b pb-2">User Age Distribution</h2>
                    {!loading && ageBracketCounts.length > 0 ? (
                        <div style={{ position: 'relative', height: '300px' }}>
                            <canvas ref={ageBracketChartRef} aria-label="Line chart showing user age distribution"></canvas>
                        </div>
                    ) : (!loading && !error && <p className="text-center text-gray-500 pt-10">No age data available.</p>)}
                    {loading && <div className="h-[300px] flex items-center justify-center text-gray-400">Loading chart...</div>}
                </div>

                {/* Weight Bracket Chart Card */}
                 <div className="lg:col-span-2 bg-white p-4 rounded-lg shadow-md" style={{ minHeight: '380px' }}>
                    <h2 className="text-lg font-semibold mb-3 text-gray-700 border-b pb-2">User Weight Distribution</h2>
                    {!loading && weightBracketCounts.length > 0 ? (
                        <div style={{ position: 'relative', height: '300px' }}>
                            <canvas ref={weightBracketChartRef} aria-label="Line chart showing user weight distribution"></canvas>
                        </div>
                    ) : (!loading && !error && <p className="text-center text-gray-500 pt-10">No weight data available.</p>)}
                     {loading && <div className="h-[300px] flex items-center justify-center text-gray-400">Loading chart...</div>}
                </div>

                {/* Symptom Chart & Table Card */}
                 <div className="bg-white p-4 rounded-lg shadow-md flex flex-col" style={{ minHeight: '450px' }}>
                    <h2 className="text-lg font-semibold mb-3 text-gray-700 border-b pb-2">Reported Symptoms</h2>
                     {!loading && symptomCounts.length > 0 ? (
                         <>
                             <div style={{ position: 'relative', height: '200px', marginBottom: '20px' }}>
                                 <canvas ref={symptomChartRef} aria-label="Bar chart showing symptom counts"></canvas>
                             </div>
                             <div className="overflow-auto flex-grow border rounded"> {/* Scrollable table container */}
                                 <table className="w-full border-collapse text-sm">
                                     <thead >
                                         <tr>
                                             <th style={tableHeaderStyle}>Symptom</th>
                                             <th style={{ ...tableHeaderStyle, textAlign: 'center' }}>Count</th>
                                         </tr>
                                     </thead>
                                     <tbody>
                                         {/* Ensure correct property access */}
                                         {symptomCounts
                                            .sort((a, b) => b.count - a.count) // Optional: Sort by count desc
                                            .map((item) => (
                                             <tr key={item.status_value} className="hover:bg-gray-50">
                                                 <td style={tableCellStyle}>{formatLabel(item.status_value)}</td>
                                                 <td style={{ ...tableCellStyle, textAlign: 'center' }}>{item.count}</td>
                                             </tr>
                                         ))}
                                     </tbody>
                                 </table>
                             </div>
                         </>
                     ) : (!loading && !error && <p className="text-center text-gray-500 pt-10">No symptom data available.</p>)}
                      {loading && <div className="flex-grow flex items-center justify-center text-gray-400">Loading chart and table...</div>}
                 </div>

                {/* Health Condition Chart & Table Card */}
                 <div className="bg-white p-4 rounded-lg shadow-md flex flex-col" style={{ minHeight: '450px' }}>
                    <h2 className="text-lg font-semibold mb-3 text-gray-700 border-b pb-2">Reported Health Conditions</h2>
                    {!loading && healthConditionCounts.length > 0 ? (
                        <>
                             <div style={{ position: 'relative', height: '200px', marginBottom: '20px' }}>
                                 <canvas ref={healthConditionChartRef} aria-label="Bar chart showing health condition counts"></canvas>
                             </div>
                             <div className="overflow-auto flex-grow border rounded"> {/* Scrollable table container */}
                                <table className="w-full border-collapse text-sm">
                                    <thead>
                                        <tr>
                                            <th style={tableHeaderStyle}>Health Condition</th>
                                            <th style={{ ...tableHeaderStyle, textAlign: 'center' }}>Count</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                         {/* Ensure correct property access */}
                                        {healthConditionCounts
                                            .sort((a, b) => b.count - a.count) // Optional: Sort by count desc
                                            .map((item) => (
                                            <tr key={item.status_value} className="hover:bg-gray-50">
                                                <td style={tableCellStyle}>{formatLabel(item.status_value)}</td>
                                                <td style={{ ...tableCellStyle, textAlign: 'center' }}>{item.count}</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </>
                    ) : (!loading && !error && <p className="text-center text-gray-500 pt-10">No health condition data available.</p>)}
                    {loading && <div className="flex-grow flex items-center justify-center text-gray-400">Loading chart and table...</div>}
                 </div>
            </div>

            {/* Message when all data is empty (and not loading/error) */}
            {!loading && !error && symptomCounts.length === 0 && healthConditionCounts.length === 0 && ageBracketCounts.length === 0 && weightBracketCounts.length === 0 && (
                <div className="text-center p-6 mt-6 bg-white rounded-lg shadow-md text-gray-500">
                    No health status data available for any category.
                </div>
            )}
        </div>
    );
}

export default AdminDashboard;