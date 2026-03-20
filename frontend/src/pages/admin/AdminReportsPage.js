/* eslint-disable react-hooks/exhaustive-deps */
import React, { useState, useEffect } from 'react';
import { adminGetReports } from '../../services/api';
import { Bar, Doughnut } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, ArcElement, Title, Tooltip, Legend } from 'chart.js';

ChartJS.register(CategoryScale, LinearScale, BarElement, ArcElement, Title, Tooltip, Legend);

const MONTHS = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];

const AdminReportsPage = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [period, setPeriod] = useState('month');

  useEffect(() => {
    adminGetReports({ period }).then(r => setData(r.data.data)).catch(() => {}).finally(() => setLoading(false));
  }, [period]);

  if (loading) return <div className="page-loader"><div className="spinner" /></div>;

  const chartOptions = {
    responsive: true,
    plugins: {
      legend: { labels: { color: '#8492a6', font: { family: 'DM Sans' } } },
      tooltip: { backgroundColor: '#111c30', borderColor: 'rgba(255,255,255,0.07)', borderWidth: 1, titleColor: '#f0f4ff', bodyColor: '#8492a6' }
    },
    scales: {
      x: { ticks: { color: '#4a5568' }, grid: { color: 'rgba(255,255,255,0.04)' } },
      y: { ticks: { color: '#4a5568' }, grid: { color: 'rgba(255,255,255,0.04)' } }
    }
  };

  const revenueLabels = data?.revenueByMonth?.map(r => `${MONTHS[r._id.month - 1]} ${r._id.year}`) || [];
  const revenueData = {
    labels: revenueLabels,
    datasets: [
      { label: 'Revenue (€)', data: data?.revenueByMonth?.map(r => (r.revenue / 100).toFixed(2)) || [], backgroundColor: 'rgba(0,232,122,0.7)', borderRadius: 6 },
      { label: 'Charity (€)', data: data?.revenueByMonth?.map(r => (r.charity / 100).toFixed(2)) || [], backgroundColor: 'rgba(245,200,66,0.7)', borderRadius: 6 },
      { label: 'Prize Pool (€)', data: data?.revenueByMonth?.map(r => (r.prizePool / 100).toFixed(2)) || [], backgroundColor: 'rgba(61,155,255,0.7)', borderRadius: 6 },
    ]
  };

  const planData = {
    labels: data?.subscriptionsByPlan?.map(p => p._id ? (p._id.charAt(0).toUpperCase() + p._id.slice(1)) : 'Unknown') || ['No data'],
    datasets: [{
      data: data?.subscriptionsByPlan?.map(p => p.count) || [1],
      backgroundColor: ['rgba(0,232,122,0.8)', 'rgba(245,200,66,0.8)', 'rgba(61,155,255,0.8)'],
      borderColor: ['rgba(0,232,122,0.3)', 'rgba(245,200,66,0.3)', 'rgba(61,155,255,0.3)'],
      borderWidth: 1
    }]
  };

  const totalRevenue = data?.revenueByMonth?.reduce((a, r) => a + r.revenue, 0) || 0;
  const totalCharity = data?.revenueByMonth?.reduce((a, r) => a + r.charity, 0) || 0;
  const totalPrizePool = data?.revenueByMonth?.reduce((a, r) => a + r.prizePool, 0) || 0;
  const totalSubs = data?.revenueByMonth?.reduce((a, r) => a + r.count, 0) || 0;

  return (
    <div className="animate-fade-in">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 28, flexWrap: 'wrap', gap: 12 }}>
        <div>
          <h1 style={{ fontFamily: 'var(--font-display)', fontSize: '2rem', marginBottom: 2 }}>REPORTS & ANALYTICS</h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>Platform performance and financial overview.</p>
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          {[['month', 'Last Month'], ['year', 'Last 12 Months']].map(([val, label]) => (
            <button key={val} onClick={() => setPeriod(val)} className={`btn btn-sm ${period === val ? 'btn-primary' : 'btn-secondary'}`}>{label}</button>
          ))}
        </div>
      </div>

      {/* Summary stats */}
      <div className="stats-grid" style={{ marginBottom: 28 }}>
        <div className="stat-card"><div className="stat-label">Total Revenue</div><div className="stat-value stat-accent">€{(totalRevenue / 100).toFixed(0)}</div></div>
        <div className="stat-card"><div className="stat-label">Charity Donated</div><div className="stat-value" style={{ color: 'var(--accent-gold)', fontFamily: 'var(--font-display)', fontSize: '2rem' }}>€{(totalCharity / 100).toFixed(0)}</div></div>
        <div className="stat-card"><div className="stat-label">Prize Pool Total</div><div className="stat-value" style={{ color: 'var(--accent-blue)', fontFamily: 'var(--font-display)', fontSize: '2rem' }}>€{(totalPrizePool / 100).toFixed(0)}</div></div>
        <div className="stat-card"><div className="stat-label">Transactions</div><div className="stat-value stat-accent">{totalSubs}</div></div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: 24, marginBottom: 24 }}>
        {/* Revenue chart */}
        <div className="card">
          <h3 style={{ fontFamily: 'var(--font-display)', fontSize: '1.1rem', marginBottom: 20 }}>REVENUE BREAKDOWN</h3>
          {revenueLabels.length === 0 ? (
            <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>No revenue data yet.</p>
          ) : (
            <Bar data={revenueData} options={chartOptions} />
          )}
        </div>

        {/* Plan breakdown */}
        <div className="card">
          <h3 style={{ fontFamily: 'var(--font-display)', fontSize: '1.1rem', marginBottom: 20 }}>PLAN SPLIT</h3>
          {!data?.subscriptionsByPlan?.length ? (
            <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>No subscribers yet.</p>
          ) : (
            <Doughnut data={planData} options={{ ...chartOptions, scales: undefined }} />
          )}
        </div>
      </div>

      {/* Charity breakdown */}
      {data?.charityBreakdown?.length > 0 && (
        <div className="card">
          <h3 style={{ fontFamily: 'var(--font-display)', fontSize: '1.1rem', marginBottom: 18 }}>CHARITY CONTRIBUTIONS</h3>
          <div>
            {data.charityBreakdown.map((c, i) => (
              <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 0', borderBottom: i < data.charityBreakdown.length - 1 ? '1px solid var(--border)' : 'none' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <div style={{ width: 32, height: 32, borderRadius: 6, background: 'var(--accent-gold-dim)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.9rem', color: 'var(--accent-gold)', fontWeight: 700 }}>
                    {c.charity?.[0]?.name?.charAt(0) || '?'}
                  </div>
                  <span style={{ fontWeight: 500, fontSize: '0.9rem' }}>{c.charity?.[0]?.name || 'Unknown'}</span>
                </div>
                <span style={{ fontFamily: 'var(--font-mono)', color: 'var(--accent-gold)', fontSize: '0.9rem' }}>
                  €{((c.total || 0) / 100).toFixed(2)}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminReportsPage;
