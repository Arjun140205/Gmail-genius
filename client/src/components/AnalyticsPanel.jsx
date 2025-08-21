// src/components/AnalyticsPanel.jsx
import React, { useEffect, useRef } from 'react';
import * as d3 from 'd3';

export default function AnalyticsPanel({ emails = [], skills = [] }) {
  const chartRef = useRef();

  useEffect(() => {
    // Don't render chart if no emails
    if (!emails || emails.length === 0) return;
    
    // Prepare tag distribution
    const tagCounts = d3.rollup(emails, v => v.length, d => d.tag);
    const tagData = Array.from(tagCounts, ([tag, count]) => ({ tag, count }));

    const svg = d3.select(chartRef.current);
    svg.selectAll("*").remove(); // clear previous

    const width = 300;
    const height = 300;
    const radius = Math.min(width, height) / 2;

    const color = d3.scaleOrdinal(d3.schemeCategory10);

    const pie = d3.pie().value(d => d.count);
    const arc = d3.arc().innerRadius(50).outerRadius(radius);

    const g = svg
      .attr('width', width)
      .attr('height', height)
      .append('g')
      .attr('transform', `translate(${width / 2}, ${height / 2})`);

    const arcs = g.selectAll('arc').data(pie(tagData)).enter();

    arcs.append('path')
      .attr('d', arc)
      .attr('fill', d => color(d.data.tag));

    arcs.append('text')
      .attr('transform', d => `translate(${arc.centroid(d)})`)
      .attr('text-anchor', 'middle')
      .attr('font-size', '12px')
      .text(d => d.data.tag);

  }, [emails]);

  const matchScore = () => {
    // Add null safety checks
    if (!emails || !skills || emails.length === 0 || skills.length === 0) {
      return { percent: 0, matched: [] };
    }
    
    const textCorpus = emails.map(e => `${e.subject || ''} ${e.snippet || ''}`.toLowerCase()).join(' ');
    const matched = skills.filter(skill => skill && textCorpus.includes(skill.toLowerCase()));
    const percent = Math.round((matched.length / skills.length) * 100);
    return { percent, matched };
  };

  const { percent, matched } = matchScore();

  return (
    <section className="analytics">
      <h3>📈 Analytics</h3>
      <div className="charts-container">
        <div>
          <p>📌 Skill Match: <strong>{percent}%</strong></p>
          <p>✅ Matched: {matched && matched.length > 0 ? matched.join(', ') : 'None'}</p>
        </div>
        <svg ref={chartRef}></svg>
      </div>
      <style>{`
        .analytics {
          margin-top: 2rem;
          padding: 1rem;
          border: 1px solid #ccc;
          border-radius: 8px;
        }
        .charts-container {
          display: flex;
          gap: 2rem;
          align-items: center;
          justify-content: space-between;
        }
        svg {
          border: 1px solid #ddd;
          border-radius: 10px;
        }
      `}</style>
    </section>
  );
}