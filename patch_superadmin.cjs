const fs = require('fs');
const content = fs.readFileSync('src/components/SuperAdminPanel.tsx', 'utf-8');

// Add activeTab state
const stateReplacement = `  const [activeTab, setActiveTab] = useState<'overview' | 'ranking'>('overview');
  // KYC modal states`;
let newContent = content.replace(/  \/\/ KYC modal states/, stateReplacement);

// Find insertion point for tabs and wrapping
const opsRoomEndIndex = newContent.indexOf('</div>\n      </div>\n\n      {/* Stats Board */}');
if (opsRoomEndIndex === -1) {
    console.error("Could not find insertion point!");
    process.exit(1);
}

// We will replace starting from `      {/* Stats Board */}`
// The current content starts from `{/* Stats Board */}` to the end of the return statement.
// We'll split the content there.
const beforeStatsBoard = newContent.substring(0, opsRoomEndIndex + 19);
const afterStatsBoardAndOpsRoom = newContent.substring(opsRoomEndIndex + 19);

const endReturnIndex = afterStatsBoardAndOpsRoom.lastIndexOf('    </div>\n  );');
if (endReturnIndex === -1) {
    console.error("Could not find end of return statement!");
    process.exit(1);
}

const mainContentStr = afterStatsBoardAndOpsRoom.substring(0, endReturnIndex);
const closingStr = afterStatsBoardAndOpsRoom.substring(endReturnIndex);

const newRenderCode = `
      {/* Tabs */}
      <div className="flex gap-4 border-b border-slate-200 px-2">
        <button
          onClick={() => setActiveTab('overview')}
          className={\`px-4 py-3 text-sm font-bold border-b-2 transition-colors cursor-pointer \${activeTab === 'overview' ? 'border-indigo-600 text-indigo-600' : 'border-transparent text-slate-500 hover:text-slate-800'}\`}
        >
          System Overview
        </button>
        <button
          onClick={() => setActiveTab('ranking')}
          className={\`px-4 py-3 text-sm font-bold border-b-2 transition-colors cursor-pointer \${activeTab === 'ranking' ? 'border-indigo-600 text-indigo-600' : 'border-transparent text-slate-500 hover:text-slate-800'}\`}
        >
          Ranking Dashboard
        </button>
      </div>

      {activeTab === 'overview' && (
        <div className="space-y-8">
${mainContentStr}
        </div>
      )}

      {activeTab === 'ranking' && (
        <div className="bg-white border border-slate-200 rounded-3xl p-6 space-y-6 shadow-sm">
          <div>
            <h3 className="text-lg font-black text-slate-900 tracking-tight flex items-center gap-2">
              <Trophy className="w-5 h-5 text-amber-500" />
              Top Jaipur Leaderboard
            </h3>
            <p className="text-slate-500 text-xs mt-1">
              Algorithmic ranking of active salons based on normalized QR volume, booking count, and verified reviews.
            </p>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm whitespace-nowrap">
              <thead className="bg-slate-50 border-b border-slate-200 text-xs uppercase font-extrabold text-slate-500 tracking-wider">
                <tr>
                  <th className="px-4 py-3 rounded-tl-2xl">Rank</th>
                  <th className="px-4 py-3">Salon Info</th>
                  <th className="px-4 py-3 text-right">QR Volume (40%)</th>
                  <th className="px-4 py-3 text-right">Bookings (35%)</th>
                  <th className="px-4 py-3 text-right">Reviews (25%)</th>
                  <th className="px-4 py-3 text-right rounded-tr-2xl">Final Score</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {rankedSalons.map((salon, idx) => (
                  <tr key={salon.id} className="hover:bg-slate-50 transition-colors">
                    <td className="px-4 py-4">
                      <span className={\`w-6 h-6 flex items-center justify-center rounded-full text-[10px] font-bold \${idx === 0 ? 'bg-amber-100 text-amber-700' : idx === 1 ? 'bg-slate-200 text-slate-700' : idx === 2 ? 'bg-orange-100 text-orange-700' : 'bg-slate-100 text-slate-500'}\`}>
                        #{idx + 1}
                      </span>
                    </td>
                    <td className="px-4 py-4">
                      <div className="font-bold text-slate-900">{salon.name}</div>
                      <div className="text-[10px] text-slate-500">{salon.area}, {salon.city}</div>
                    </td>
                    <td className="px-4 py-4 text-right">
                      <span className="font-mono text-slate-900">Rs. {salon.metrics.qrPaymentsTotal}</span>
                    </td>
                    <td className="px-4 py-4 text-right">
                      <span className="font-bold text-slate-700">{salon.metrics.bookingsTotal}</span>
                    </td>
                    <td className="px-4 py-4 text-right">
                      <div className="font-bold text-slate-700">{salon.metrics.averageRating.toFixed(1)} <span className="text-amber-500 text-[10px]">★</span></div>
                      <div className="text-[10px] text-slate-500">({salon.metrics.totalReviews})</div>
                    </td>
                    <td className="px-4 py-4 text-right">
                      <span className="bg-indigo-50 text-indigo-700 font-black px-2.5 py-1 rounded-md text-sm border border-indigo-100">
                        {salon.score}
                      </span>
                    </td>
                  </tr>
                ))}
                {rankedSalons.length === 0 && (
                  <tr>
                    <td colSpan={6} className="px-4 py-8 text-center text-slate-500 text-xs">
                      No active salons with metrics found.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}
`;

fs.writeFileSync('src/components/SuperAdminPanel.tsx', beforeStatsBoard + newRenderCode + closingStr);
console.log("Patched successfully");
