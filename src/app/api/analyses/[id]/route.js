import sql from '../../utils/sql.js';

// Get specific analysis with detailed data
export async function GET(request, { params }) {
  try {
    const { id } = params;

    // Get analysis details
    const analysis = await sql(`
      SELECT * FROM analyses WHERE id = $1
    `, [id]);

    if (analysis.length === 0) {
      return Response.json({ 
        success: false, 
        error: 'Analysis not found' 
      }, { status: 404 });
    }

    // Get alerts for this analysis
    const alerts = await sql(`
      SELECT * FROM alerts 
      WHERE analysis_id = $1 
      ORDER BY timestamp_detected DESC
    `, [id]);

    // Get drone nodes for this analysis
    const droneNodes = await sql(`
      SELECT * FROM drone_nodes 
      WHERE analysis_id = $1 
      ORDER BY trust_score DESC
    `, [id]);

    // Get network metrics for this analysis
    const metrics = await sql(`
      SELECT * FROM network_metrics 
      WHERE analysis_id = $1 
      ORDER BY timestamp_recorded ASC
    `, [id]);

    return Response.json({
      success: true,
      analysis: analysis[0],
      alerts: alerts,
      droneNodes: droneNodes,
      metrics: metrics
    });
  } catch (error) {
    console.error('Error fetching analysis details:', error);
    return Response.json({ 
      success: false, 
      error: 'Failed to fetch analysis details' 
    }, { status: 500 });
  }
}