import sql from '../utils/sql.js';

// Get all analyses with summary stats
export async function GET(request) {
  try {
    const url = new URL(request.url);
    const limit = parseInt(url.searchParams.get('limit')) || 50;
    const status = url.searchParams.get('status');

    let query = `
      SELECT id, filename, file_size, upload_timestamp, status, progress, 
             trust_score, attacks_detected, anomaly_score, total_packets, 
             total_nodes, analysis_duration, completed_at
      FROM analyses
    `;
    const params = [];

    if (status) {
      query += ` WHERE status = $${params.length + 1}`;
      params.push(status);
    }

    query += ` ORDER BY upload_timestamp DESC LIMIT $${params.length + 1}`;
    params.push(limit);

    const analyses = await sql(query, params);

    return Response.json({
      success: true,
      analyses: analyses
    });
  } catch (error) {
    console.error('Error fetching analyses:', error);
    return Response.json({ 
      success: false, 
      error: 'Failed to fetch analyses' 
    }, { status: 500 });
  }
}

// Create new analysis (upload .pcap file)
export async function POST(request) {
  try {
    const formData = await request.formData();
    const file = formData.get('file');
    
    if (!file) {
      return Response.json({ 
        success: false, 
        error: 'No file provided' 
      }, { status: 400 });
    }

    // Validate file type
    if (!file.name.endsWith('.pcap')) {
      return Response.json({ 
        success: false, 
        error: 'Only .pcap files are supported' 
      }, { status: 400 });
    }

    // Insert new analysis record
    const result = await sql(`
      INSERT INTO analyses (filename, file_size, status, progress)
      VALUES ($1, $2, $3, $4)
      RETURNING id, filename, file_size, upload_timestamp, status, progress
    `, [file.name, file.size, 'processing', 0]);

    const analysisId = result[0].id;

    // Simulate async processing (in real app, this would be queued)
    simulateAnalysisProcessing(analysisId);

    return Response.json({
      success: true,
      analysis: result[0]
    });
  } catch (error) {
    console.error('Error creating analysis:', error);
    return Response.json({ 
      success: false, 
      error: 'Failed to create analysis' 
    }, { status: 500 });
  }
}

// Simulate the IDS analysis processing
async function simulateAnalysisProcessing(analysisId) {
  const steps = [
    { progress: 20, description: 'Parsing network packets...' },
    { progress: 40, description: 'Extracting features...' },
    { progress: 60, description: 'Running rule-based detection...' },
    { progress: 80, description: 'Applying ML anomaly detection...' },
    { progress: 90, description: 'Generating trust scores...' },
    { progress: 100, description: 'Analysis complete' }
  ];

  for (let i = 0; i < steps.length; i++) {
    await new Promise(resolve => setTimeout(resolve, 2000)); // 2 second delay
    
    if (i === steps.length - 1) {
      // Final step - mark as completed with results
      const trustScore = 0.65 + Math.random() * 0.3; // Random trust score 0.65-0.95
      const attacksDetected = Math.floor(Math.random() * 6); // 0-5 attacks
      const anomalyScore = Math.random() * 0.5; // 0-0.5 anomaly score
      const totalPackets = 5000 + Math.floor(Math.random() * 15000); // 5k-20k packets
      const totalNodes = 8 + Math.floor(Math.random() * 12); // 8-20 nodes
      const analysisDuration = 25 + Math.floor(Math.random() * 40); // 25-65 seconds

      await sql(`
        UPDATE analyses 
        SET progress = $1, status = $2, trust_score = $3, attacks_detected = $4,
            anomaly_score = $5, total_packets = $6, total_nodes = $7, 
            analysis_duration = $8, completed_at = CURRENT_TIMESTAMP
        WHERE id = $9
      `, [100, 'completed', trustScore, attacksDetected, anomalyScore, 
          totalPackets, totalNodes, analysisDuration, analysisId]);

      // Generate some sample alerts if attacks were detected
      if (attacksDetected > 0) {
        await generateSampleAlerts(analysisId, attacksDetected, totalNodes);
      }

      // Generate sample drone nodes
      await generateSampleDroneNodes(analysisId, totalNodes);

    } else {
      // Update progress
      await sql(`
        UPDATE analyses SET progress = $1 WHERE id = $2
      `, [steps[i].progress, analysisId]);
    }
  }
}

async function generateSampleAlerts(analysisId, numAlerts, totalNodes) {
  const attackTypes = ['Blackhole', 'Wormhole', 'Sybil', 'Flooding', 'Jamming'];
  const severities = ['low', 'medium', 'high', 'critical'];
  const detectionMethods = ['rule-based', 'ml-isolation-forest', 'ml-lstm'];

  for (let i = 0; i < numAlerts; i++) {
    const attackType = attackTypes[Math.floor(Math.random() * attackTypes.length)];
    const severity = severities[Math.floor(Math.random() * severities.length)];
    const detectionMethod = detectionMethods[Math.floor(Math.random() * detectionMethods.length)];
    const nodeId = `UAV_${String(Math.floor(Math.random() * totalNodes) + 1).padStart(2, '0')}`;
    const confidence = 0.6 + Math.random() * 0.4; // 0.6-1.0

    await sql(`
      INSERT INTO alerts (analysis_id, attack_type, affected_node_id, severity, 
                         confidence, detection_method, packet_timestamp, description)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
    `, [
      analysisId, attackType, nodeId, severity, confidence, detectionMethod,
      new Date(Date.now() - Math.random() * 3600000), // Random time in last hour
      `${attackType} attack detected on node ${nodeId} via ${detectionMethod}`
    ]);
  }
}

async function generateSampleDroneNodes(analysisId, totalNodes) {
  for (let i = 1; i <= totalNodes; i++) {
    const nodeId = `UAV_${String(i).padStart(2, '0')}`;
    const trustScore = 0.6 + Math.random() * 0.4; // 0.6-1.0
    const status = trustScore > 0.8 ? 'trusted' : trustScore > 0.5 ? 'suspicious' : 'malicious';
    const x = Math.random() * 300; // 0-300 units
    const y = Math.random() * 300;
    const z = 30 + Math.random() * 50; // 30-80 units altitude
    const packetsSent = Math.floor(Math.random() * 2000);
    const packetsReceived = Math.floor(packetsSent * (0.8 + Math.random() * 0.2));
    const packetsDropped = Math.floor(packetsSent * Math.random() * 0.1);

    await sql(`
      INSERT INTO drone_nodes (analysis_id, node_id, trust_score, status, 
                              x_position, y_position, z_position, packets_sent, 
                              packets_received, packets_dropped, last_seen)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
    `, [
      analysisId, nodeId, trustScore, status, x, y, z, 
      packetsSent, packetsReceived, packetsDropped, new Date()
    ]);
  }
}