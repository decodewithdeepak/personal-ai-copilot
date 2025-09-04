import React, { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Cloud, CloudRain, Sun, Wind, Droplets, Thermometer, RefreshCw } from 'lucide-react';

interface WeatherData {
    available: boolean;
    location?: string;
    temperature?: number;
    condition?: string;
    humidity?: number;
    wind_speed?: number;
    error?: string;
}

interface WeatherCardProps {
    API_URL: string;
}

export function WeatherCard({ API_URL }: WeatherCardProps) {
    const [weather, setWeather] = useState<WeatherData | null>(null);
    const [loading, setLoading] = useState(false);

    const getWeatherIcon = (condition: string) => {
        if (condition?.includes('rain') || condition?.includes('drizzle')) {
            return <CloudRain className="h-8 w-8 text-blue-400" />;
        }
        if (condition?.includes('cloud')) {
            return <Cloud className="h-8 w-8 text-gray-400" />;
        }
        return <Sun className="h-8 w-8 text-yellow-400" />;
    };

    const fetchWeather = async () => {
        setLoading(true);
        try {
            const response = await fetch(`${API_URL}/api/weather/current`);
            const data = await response.json();
            if (data.success) {
                setWeather(data.weather);
            } else {
                setWeather({ available: false, error: 'Failed to fetch weather' });
            }
        } catch (error) {
            console.error('Error fetching weather:', error);
            setWeather({ available: false, error: 'Network error' });
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchWeather();
    }, []);

    return (
        <Card className="bg-zinc-950 border border-zinc-800 h-[300px]">
            <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle className="text-white flex items-center gap-2">
                    {weather?.available && weather.condition ? getWeatherIcon(weather.condition) : <Cloud className="h-5 w-5 text-gray-400" />}
                    Weather
                </CardTitle>
                <Button
                    onClick={fetchWeather}
                    disabled={loading}
                    size="sm"
                    variant="ghost"
                    className="text-zinc-400 hover:text-white"
                >
                    <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
                </Button>
            </CardHeader>
            <CardContent className="space-y-4">
                {loading ? (
                    <div className="flex items-center justify-center h-32">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white"></div>
                    </div>
                ) : weather?.available ? (
                    <div className="space-y-4">
                        <div className="text-center">
                            <div className="text-3xl font-bold text-white mb-1">
                                {Math.round(weather.temperature || 0)}°C
                            </div>
                            <div className="text-zinc-400 capitalize">
                                {weather.condition}
                            </div>
                            <div className="text-sm text-zinc-500 mt-1">
                                {weather.location}
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div className="flex items-center gap-2">
                                <Droplets className="h-4 w-4 text-blue-400" />
                                <div className="text-sm">
                                    <div className="text-zinc-400">Humidity</div>
                                    <div className="text-white">{weather.humidity}%</div>
                                </div>
                            </div>
                            <div className="flex items-center gap-2">
                                <Wind className="h-4 w-4 text-gray-400" />
                                <div className="text-sm">
                                    <div className="text-zinc-400">Wind</div>
                                    <div className="text-white">{weather.wind_speed} m/s</div>
                                </div>
                            </div>
                        </div>
                    </div>
                ) : (
                    <div className="text-center py-8">
                        <Cloud className="h-12 w-12 text-zinc-600 mx-auto mb-3" />
                        <p className="text-zinc-500 text-sm">
                            {weather?.error || 'Weather data unavailable'}
                        </p>
                        <Button
                            onClick={fetchWeather}
                            size="sm"
                            className="mt-3 bg-zinc-800 hover:bg-zinc-700 text-white"
                        >
                            Retry
                        </Button>
                    </div>
                )}
            </CardContent>
        </Card>
    );
}
