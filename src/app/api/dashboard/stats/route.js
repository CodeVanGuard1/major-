import sql from '../../utils/sql.js';

// Get dashboard statistics
export async function GET(request) {
  try {
    // Get total analyses count
    const totalAnalyses = await sql(`
      SELECT COUNT(*) as count FROM analyses
    `);

    // Get active threats (recent alerts from last 24 hours)
    const activeThreats = await sql(`
      SELECT COUNT(*) as count 
      FROM alerts 
      WHERE timestamp_detected > NOW() - INTERVAL '24 hours'
    `);

    // Get average trust score across all completed analyses
    const avgTrustScore = await sql(`
      SELECT AVG(trust_score) as avg_score 
      FROM analyses 
      WHERE status = 'completed' AND trust_score IS NOT NULL
    `);

    // Get network health status (based on recent analysis results)
    const recentAnalyses = await sql(`
      SELECT AVG(trust_score) as health_score 
      FROM analyses 
      WHERE status = 'completed' 
        AND completed_at > NOW() - INTERVAL '7 days'
        AND trust_score IS NOT NULL
    `);

    // Get recent threats for the dashboard
    const recentThreats = await sql(`
      SELECT a.attack_type, a.affected_node_id, a.severity, a.timestamp_detected,
             an.filename
      FROM alerts a
      JOIN analyses an ON a.analysis_id = an.id
      ORDER BY a.timestamp_detected DESC
      LIMIT 5
    `);

    // Get threat distribution by type
    const threatDistribution = await sql(`
      SELECT attack_type, COUNT(*) as count
      FROM alerts
      WHERE timestamp_detected > NOW() - INTERVAL '30 days'
      GROUP BY attack_type
      ORDER BY count DESC
    `);

    // Calculate network health status
    const healthScore = recentAnalyses[0]?.health_score || 0;
    let networkHealth = 'Poor';
    if (healthScore > 0.8) networkHealth = 'Excellent';
    else if (healthScore > 0.6) networkHealth = 'Good';
    else if (healthScore > 0.4) networkHealth = 'Fair';

    return Response.json({
      success: true,
      stats: {
        totalAnalyses: parseInt(totalAnalyses[0].count),
        activeThreats: parseInt(activeThreats[0].count),
        averageTrustScore: parseFloat(avgTrustScore[0].avg_score || 0),
        networkHealth: networkHealth,
        healthScore: parseFloat(healthScore)
      },
      recentThreats: recentThreats,
      threatDistribution: threatDistribution
    });
  } catch (error) {
    console.error('Error fetching dashboard stats:', error);
    return Response.json({ 
      success: false, 
      error: 'Failed to fetch dashboard statistics' 
    }, { status: 500 });
  }
}