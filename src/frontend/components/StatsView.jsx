import React from 'react';
import { PieChart, BarChart3, Book, HardDrive, FileText, Percent } from 'lucide-react';

export function StatsView({ stats }) {
    return (
        <div className="animate-fade-in">
            <h2 className="text-3xl font-serif font-bold text-sage-800 mb-8 px-4">Library Statistics</h2>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 px-4 mb-10">
                <StatCard
                    icon={<Book className="w-6 h-6 text-rose-500" />}
                    label="Total Books"
                    value={stats.total}
                    color="bg-rose-50"
                />
                <StatCard
                    icon={<Percent className="w-6 h-6 text-sage-600" />}
                    label="LibGen Coverage"
                    value={`${stats.percentage}%`}
                    color="bg-sage-50"
                />
                <StatCard
                    icon={<HardDrive className="w-6 h-6 text-blue-500" />}
                    label="Total Size"
                    value={stats.totalSize}
                    color="bg-blue-50"
                />
                <StatCard
                    icon={<FileText className="w-6 h-6 text-amber-500" />}
                    label="Formats"
                    value={Object.keys(stats.formats).length}
                    color="bg-amber-50"
                />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 px-4">
                {/* Format Distribution */}
                <div className="bg-white p-8 rounded-3xl shadow-soft border border-stone-100">
                    <div className="flex items-center gap-3 mb-6">
                        <div className="p-2 bg-amber-50 rounded-xl text-amber-600">
                            <PieChart className="w-5 h-5" />
                        </div>
                        <h3 className="text-xl font-bold text-sage-800">Format Distribution</h3>
                    </div>

                    {Object.keys(stats.formats).length > 0 ? (
                        <div className="space-y-4">
                            {Object.entries(stats.formats).map(([format, count]) => (
                                <div key={format} className="relative">
                                    <div className="flex justify-between text-sm font-medium text-sage-600 mb-1">
                                        <span>{format}</span>
                                        <span>{count}</span>
                                    </div>
                                    <div className="h-2 bg-stone-100 rounded-full overflow-hidden">
                                        <div
                                            className="h-full bg-amber-400 rounded-full transition-all duration-500"
                                            style={{ width: `${(count / stats.total) * 100}%` }}
                                        />
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="text-center py-10 text-sage-400">
                            No format data available
                        </div>
                    )}
                </div>

                {/* Library Health */}
                <div className="bg-white p-8 rounded-3xl shadow-soft border border-stone-100">
                    <div className="flex items-center gap-3 mb-6">
                        <div className="p-2 bg-sage-50 rounded-xl text-sage-600">
                            <BarChart3 className="w-5 h-5" />
                        </div>
                        <h3 className="text-xl font-bold text-sage-800">Library Health</h3>
                    </div>

                    <div className="space-y-6">
                        <div className="flex items-center justify-between p-4 bg-stone-50 rounded-2xl">
                            <div>
                                <p className="text-sm font-medium text-sage-500">Books with Downloads</p>
                                <p className="text-2xl font-bold text-sage-800">{stats.withLibgen}</p>
                            </div>
                            <div className="h-12 w-12 rounded-full border-4 border-sage-200 flex items-center justify-center text-xs font-bold text-sage-600">
                                {stats.percentage}%
                            </div>
                        </div>

                        <div className="p-4 bg-rose-50/50 rounded-2xl border border-rose-100">
                            <p className="text-sm text-rose-700 leading-relaxed">
                                <strong>Tip:</strong> You can automatically search for missing downloads by clicking the "Auto-Match" button on book cards.
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

function StatCard({ icon, label, value, color }) {
    return (
        <div className="bg-white p-6 rounded-3xl shadow-soft border border-stone-100 flex items-center gap-4 hover:shadow-soft-lg transition-shadow duration-300">
            <div className={`w-12 h-12 ${color} rounded-2xl flex items-center justify-center`}>
                {icon}
            </div>
            <div>
                <p className="text-sm font-medium text-sage-500">{label}</p>
                <p className="text-2xl font-bold text-sage-800">{value}</p>
            </div>
        </div>
    );
}
