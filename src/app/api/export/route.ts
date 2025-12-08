import { NextRequest, NextResponse } from 'next/server';
import { jsPDF } from 'jspdf';
import { Document, Packer, Paragraph, TextRun, HeadingLevel } from 'docx';
import type { SOP } from '@/types';

export async function POST(request: NextRequest) {
  try {
    const { sop, format, completedSteps = [] } = await request.json();

    if (!sop || !format) {
      return NextResponse.json(
        { error: 'Missing required parameters' },
        { status: 400 }
      );
    }

    switch (format) {
      case 'pdf':
        return await generatePDF(sop, completedSteps);
      case 'docx':
        return await generateDOCX(sop, completedSteps);
      case 'html':
        return generateHTML(sop, completedSteps);
      case 'clipboard':
        return generateClipboardText(sop, completedSteps);
      default:
        return NextResponse.json(
          { error: 'Unsupported format' },
          { status: 400 }
        );
    }
  } catch (error) {
    console.error('Export error:', error);
    return NextResponse.json(
      { error: 'Export failed' },
      { status: 500 }
    );
  }
}

async function generatePDF(sop: SOP, completedSteps: string[]) {
  const doc = new jsPDF('p', 'mm', 'a4');
  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const margin = 20;
  const contentWidth = pageWidth - (margin * 2);
  let yPosition = margin;

  // Professional color palette
  const colors = {
    primary: [59, 130, 246],    // Blue-500
    secondary: [99, 102, 241],   // Indigo-500  
    success: [34, 197, 94],      // Green-500
    warning: [245, 158, 11],     // Amber-500
    danger: [239, 68, 68],       // Red-500
    dark: [17, 24, 39],          // Gray-900
    medium: [75, 85, 99],        // Gray-600
    light: [156, 163, 175]       // Gray-400
  };

  // Improved helper function for page management
  const checkPageSpace = (requiredSpace: number = 20) => {
    if (yPosition + requiredSpace > pageHeight - margin - 15) {
      doc.addPage();
      yPosition = margin + 10;
      return true;
    }
    return false;
  };

  // Professional text rendering with consistent spacing
  const addText = (
    text: string, 
    fontSize: number, 
    style: 'normal' | 'bold' = 'normal', 
    color: number[] = colors.dark,
    leftIndent: number = 0,
    bottomSpacing: number = 6
  ) => {
    // Set text properties
    doc.setFontSize(fontSize);
    doc.setFont('helvetica', style);
    doc.setTextColor(color[0], color[1], color[2]);
    
    // Calculate proper line height (more generous for readability)
    const lineHeight = fontSize * 0.4 + 2; // Consistent line height formula
    const lines = doc.splitTextToSize(text, contentWidth - leftIndent);
    const totalTextHeight = lines.length * lineHeight;
    
    // Check if we need a new page
    checkPageSpace(totalTextHeight + bottomSpacing);
    
    // Render each line with consistent positioning
    lines.forEach((line: string, index: number) => {
      doc.text(line, margin + leftIndent, yPosition + (index * lineHeight) + fontSize * 0.3);
    });
    
    // Update position with proper spacing
    yPosition += totalTextHeight + bottomSpacing;
  };

  // Professional header with clean design
  const addHeader = () => {
    // Company logo (simple square)
    doc.setFillColor(colors.primary[0], colors.primary[1], colors.primary[2]);
    doc.roundedRect(margin, yPosition, 12, 12, 2, 2, 'F');
    
    // Company name
    doc.setFontSize(22);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(colors.dark[0], colors.dark[1], colors.dark[2]);
    doc.text('sopify', margin + 18, yPosition + 8);
    
    // Tagline
    doc.setFontSize(9);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(colors.medium[0], colors.medium[1], colors.medium[2]);
    doc.text('Enterprise Operations Platform', margin + 18, yPosition + 13);
    
    yPosition += 25;
  };

  // Clean section headers with consistent styling
  const addSectionHeader = (title: string, color: number[] = colors.primary) => {
    checkPageSpace(25);
    
    // Section divider line
    doc.setDrawColor(color[0], color[1], color[2]);
    doc.setLineWidth(0.8);
    doc.line(margin, yPosition, pageWidth - margin, yPosition);
    
    yPosition += 6;
    
    // Section title
    doc.setFontSize(14);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(color[0], color[1], color[2]);
    doc.text(title, margin, yPosition + 4);
    
    yPosition += 12;
  };

  // Generate comprehensive document
  addHeader();

  // Document title with SOP classification
  addText('STANDARD OPERATING PROCEDURE', 12, 'normal', colors.medium, 0, 4);
  addText(sop.title, 18, 'bold', colors.dark, 0, 12);

  // Document classification and metadata
  const addClassificationCard = () => {
    checkPageSpace(50);
    
    // Classification header
    doc.setFillColor(239, 246, 255); // Light blue background
    doc.setDrawColor(147, 197, 253); // Blue border
    doc.roundedRect(margin, yPosition, contentWidth, 45, 2, 2, 'FD');
    
    const metaY = yPosition + 6;
    doc.setFontSize(11);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(colors.dark[0], colors.dark[1], colors.dark[2]);
    
    // Classification details
    doc.text('INCIDENT CLASSIFICATION', margin + 8, metaY + 4);
    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    
    doc.text(`Incident Type: ${sop.incidentType}`, margin + 8, metaY + 12);
    doc.text(`Severity Level: ${sop.severity}`, margin + 8, metaY + 18);
    doc.text(`Primary Responsible Team: ${sop.responsibleTeam}`, margin + 8, metaY + 24);
    doc.text(`Document Generated: ${new Date(sop.createdAt).toLocaleString()}`, margin + 8, metaY + 30);
    doc.text(`Document Version: 1.0`, margin + 8, metaY + 36);
    
    // Status indicator
    const statusX = margin + (contentWidth * 0.7);
    doc.setFontSize(9);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(colors.success[0], colors.success[1], colors.success[2]);
    doc.text('STATUS: ACTIVE', statusX, metaY + 12);
    doc.setTextColor(colors.medium[0], colors.medium[1], colors.medium[2]);
    doc.text(`Classification: ${sop.severity.toUpperCase()}`, statusX, metaY + 18);
    
    yPosition += 55;
  };

  addClassificationCard();

  // Executive Summary
  addSectionHeader('EXECUTIVE SUMMARY', colors.primary);
  addText('This Standard Operating Procedure (SOP) provides comprehensive guidelines for responding to and preventing incidents of type "' + sop.incidentType + '" with ' + sop.severity.toLowerCase() + ' severity impact. The procedures outlined below ensure systematic incident resolution, minimize operational disruption, and prevent future occurrences through structured preventive measures.', 10, 'normal', colors.dark, 0, 12);

  // Risk Assessment
  addSectionHeader('RISK ASSESSMENT & IMPACT ANALYSIS', colors.warning);
  const riskLevel = sop.severity === 'High' ? 'CRITICAL' : sop.severity === 'Medium' ? 'MODERATE' : 'LOW';
  const riskColor = sop.severity === 'High' ? colors.danger : sop.severity === 'Medium' ? colors.warning : colors.success;
  
  addText(`Risk Level: ${riskLevel}`, 11, 'bold', riskColor, 0, 6);
  addText(`Business Impact: ${sop.severity} severity incidents of type "${sop.incidentType}" can significantly affect operational continuity, system availability, and business processes. Immediate response is critical to minimize downtime and prevent cascading failures.`, 10, 'normal', colors.dark, 0, 8);
  addText(`Affected Systems: Primary systems and dependent services may experience degraded performance or complete unavailability during incident occurrence.`, 10, 'normal', colors.dark, 0, 12);

  // Problem/Trigger section with enhanced detail
  addSectionHeader('INCIDENT TRIGGER & PROBLEM STATEMENT', colors.danger);
  
  checkPageSpace(25);
  doc.setFillColor(254, 242, 242); // Light red background
  doc.setDrawColor(252, 165, 165); // Red border
  doc.roundedRect(margin, yPosition, contentWidth, 20, 2, 2, 'FD');
  
  yPosition += 4;
  addText('Primary Trigger:', 10, 'bold', colors.dark, 8, 4);
  addText(sop.trigger, 10, 'normal', colors.dark, 8, 8);
  
  addText('Detection Methods:', 10, 'bold', colors.dark, 8, 4);
  addText('• Automated monitoring alerts and system health checks\n• User reports and service desk notifications\n• Performance degradation indicators\n• System log analysis and error pattern recognition', 10, 'normal', colors.dark, 8, 12);

  // Immediate Response Actions
  addSectionHeader('IMMEDIATE RESPONSE ACTIONS (Phase 1)', colors.danger);
  addText('Execute these actions immediately upon incident detection. Time is critical for ' + sop.severity.toLowerCase() + ' severity incidents.', 10, 'italic', colors.medium, 0, 8);
  
  const renderDetailedStep = (step: any, index: number, isImmediate: boolean = true, phase: string = '') => {
    const isCompleted = completedSteps.includes(step.id);
    const stepColor = isImmediate ? colors.danger : colors.warning;
    
    checkPageSpace(50);
    
    // Step header box
    doc.setFillColor(isImmediate ? 254 : 255, isImmediate ? 242 : 251, isImmediate ? 242 : 235);
    doc.setDrawColor(isImmediate ? 252 : 245, isImmediate ? 165 : 158, isImmediate ? 165 : 11);
    doc.roundedRect(margin, yPosition, contentWidth, 35, 2, 2, 'FD');
    
    // Step indicator
    const indicatorY = yPosition + 8;
    if (isImmediate) {
      // Numbered circle for immediate steps
      doc.setFillColor(isCompleted ? colors.success[0] : stepColor[0], 
                       isCompleted ? colors.success[1] : stepColor[1], 
                       isCompleted ? colors.success[2] : stepColor[2]);
      doc.circle(margin + 8, indicatorY, 4, 'F');
      
      // Number inside circle
      doc.setFontSize(10);
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(255, 255, 255);
      doc.text(`${index + 1}`, margin + 6, indicatorY + 1);
    } else {
      // Square for preventive steps  
      doc.setFillColor(isCompleted ? colors.success[0] : stepColor[0], 
                       isCompleted ? colors.success[1] : stepColor[1], 
                       isCompleted ? colors.success[2] : stepColor[2]);
      doc.roundedRect(margin + 5, indicatorY - 3, 6, 6, 1, 1, 'F');
    }
    
    // Step details inside box
    yPosition += 6;
    const titleText = `${phase}${step.title}${isCompleted ? ' ✓ COMPLETED' : ''}`;
    addText(titleText, 12, 'bold', colors.dark, 20, 4);
    
    addText(`Action Required: ${step.description}`, 10, 'normal', colors.dark, 20, 6);
    
    // Enhanced metadata
    let metaInfo = '';
    if (step.responsible) metaInfo += `Responsible: ${step.responsible}`;
    if (step.estimatedTime) metaInfo += metaInfo ? ` | Duration: ${step.estimatedTime}` : `Duration: ${step.estimatedTime}`;
    if (step.priority) metaInfo += ` | Priority: ${step.priority.toUpperCase()}`;
    
    addText(metaInfo, 9, 'normal', colors.medium, 20, 8);
    
    yPosition += 6; // Extra spacing between steps
  };

  // Render all immediate steps with enhanced detail
  sop.immediateSteps.forEach((step, index) => {
    renderDetailedStep(step, index, true, `STEP ${index + 1}: `);
  });

  // Escalation Procedures
  addSectionHeader('ESCALATION PROCEDURES', colors.secondary);
  addText('If immediate actions fail to resolve the incident within the estimated timeframes, follow these escalation procedures:', 10, 'normal', colors.dark, 0, 8);
  
  addText('Level 1 Escalation (15 minutes):', 11, 'bold', colors.dark, 0, 4);
  addText('• Notify team lead and senior operations staff\n• Activate backup systems if available\n• Initiate customer communication protocols', 10, 'normal', colors.dark, 8, 8);
  
  addText('Level 2 Escalation (30 minutes):', 11, 'bold', colors.dark, 0, 4); 
  addText('• Contact executive leadership and incident commander\n• Engage external vendor support if required\n• Activate business continuity plans', 10, 'normal', colors.dark, 8, 8);
  
  addText('Level 3 Escalation (60 minutes):', 11, 'bold', colors.dark, 0, 4);
  addText('• Invoke disaster recovery procedures\n• Notify regulatory bodies if required\n• Implement alternative service delivery methods', 10, 'normal', colors.dark, 8, 12);

  // Root Cause Analysis
  addSectionHeader('ROOT CAUSE ANALYSIS FRAMEWORK', colors.secondary);
  addText('Once the immediate incident is resolved, conduct a thorough root cause analysis using the following framework:', 10, 'normal', colors.dark, 0, 8);
  
  addText('1. Timeline Reconstruction:', 11, 'bold', colors.dark, 0, 4);
  addText('Document exact sequence of events, system states, and user actions leading to the incident.', 10, 'normal', colors.dark, 8, 6);
  
  addText('2. Impact Assessment:', 11, 'bold', colors.dark, 0, 4);
  addText('Quantify business impact including downtime duration, affected users, revenue loss, and compliance implications.', 10, 'normal', colors.dark, 8, 6);
  
  addText('3. Contributing Factors Analysis:', 11, 'bold', colors.dark, 0, 4);
  addText('Identify technical, process, and human factors that contributed to incident occurrence and severity.', 10, 'normal', colors.dark, 8, 8);

  // Preventive Measures & Long-term Mitigation
  yPosition += 8;
  addSectionHeader('PREVENTIVE MEASURES & LONG-TERM MITIGATION (Phase 2)', colors.warning);
  addText('Implement these measures to prevent incident recurrence and strengthen system resilience:', 10, 'italic', colors.medium, 0, 8);
  
  // Render all preventive steps with enhanced detail
  sop.preventiveActions.forEach((step, index) => {
    renderDetailedStep(step, index, false, `PREVENTION ${index + 1}: `);
  });

  // Additional preventive measures
  addText('ADDITIONAL RECOMMENDED PREVENTIVE MEASURES:', 12, 'bold', colors.warning, 0, 8);
  
  addText('System Hardening:', 11, 'bold', colors.dark, 0, 4);
  addText('• Implement redundancy and failover mechanisms\n• Enhance monitoring and alerting capabilities\n• Regular system health checks and maintenance schedules', 10, 'normal', colors.dark, 8, 8);
  
  addText('Process Improvements:', 11, 'bold', colors.dark, 0, 4);
  addText('• Update incident response procedures based on lessons learned\n• Enhance team training and knowledge sharing\n• Implement automated recovery procedures where possible', 10, 'normal', colors.dark, 8, 8);
  
  addText('Compliance & Governance:', 11, 'bold', colors.dark, 0, 4);
  addText('• Regular compliance audits and process reviews\n• Documentation updates and version control\n• Stakeholder communication and approval processes', 10, 'normal', colors.dark, 8, 12);

  // Team Responsibilities & Contact Information
  addSectionHeader('TEAM RESPONSIBILITIES & CONTACTS', colors.secondary);
  
  checkPageSpace(40);
  doc.setFillColor(240, 249, 255); // Very light blue
  doc.setDrawColor(191, 219, 254); // Light blue border
  doc.roundedRect(margin, yPosition, contentWidth, 35, 2, 2, 'FD');
  
  yPosition += 6;
  addText('Primary Response Team:', 11, 'bold', colors.dark, 8, 4);
  addText(`${sop.responsibleTeam} - Lead incident response and coordination`, 10, 'normal', colors.dark, 8, 6);
  
  addText('Secondary Support Teams:', 11, 'bold', colors.dark, 8, 4);
  addText('• Technical Operations - System diagnostics and recovery\n• DevOps Team - Infrastructure and deployment support\n• Customer Support - External communication and user assistance\n• Management - Decision making and resource allocation', 10, 'normal', colors.dark, 8, 12);
  
  // Performance Metrics & Success Criteria
  addSectionHeader('PERFORMANCE METRICS & SUCCESS CRITERIA', colors.success);
  
  addText('Key Performance Indicators (KPIs):', 11, 'bold', colors.dark, 0, 4);
  const resolutionTarget = sop.severity === 'High' ? '< 30 minutes' : sop.severity === 'Medium' ? '< 60 minutes' : '< 120 minutes';
  const availabilityTarget = sop.severity === 'High' ? '99.9%' : sop.severity === 'Medium' ? '99.5%' : '99.0%';
  
  addText(`• Incident Resolution Time: ${resolutionTarget}`, 10, 'normal', colors.dark, 8, 4);
  addText(`• System Availability Target: ${availabilityTarget}`, 10, 'normal', colors.dark, 8, 4);
  addText(`• Customer Impact: Minimize affected user count`, 10, 'normal', colors.dark, 8, 4);
  addText(`• Communication Response: < 5 minutes initial notification`, 10, 'normal', colors.dark, 8, 8);
  
  addText('Success Criteria:', 11, 'bold', colors.dark, 0, 4);
  addText('• Incident fully resolved within target timeframe\n• No data loss or corruption occurred\n• All affected services restored to normal operation\n• Root cause identified and documented\n• Preventive measures implemented and verified', 10, 'normal', colors.dark, 8, 12);

  // Compliance & Regulatory Requirements
  addSectionHeader('COMPLIANCE & REGULATORY REQUIREMENTS', colors.warning);
  
  addText('Applicable Standards & Frameworks:', 11, 'bold', colors.dark, 0, 4);
  addText('• ISO 27001 - Information Security Management\n• ITIL v4 - IT Service Management best practices\n• SOX Compliance - Financial reporting and controls\n• GDPR/Data Protection - Privacy and data handling requirements', 10, 'normal', colors.dark, 8, 8);
  
  addText('Documentation Requirements:', 11, 'bold', colors.dark, 0, 4);
  addText('• All incident response actions must be logged with timestamps\n• Post-incident review report required within 48 hours\n• Evidence preservation for audit and compliance purposes\n• Stakeholder notification and communication records', 10, 'normal', colors.dark, 8, 12);

  // Follow-up Actions & Timeline
  addSectionHeader('FOLLOW-UP ACTIONS & IMPLEMENTATION TIMELINE', colors.primary);
  
  checkPageSpace(30);
  doc.setFillColor(255, 247, 237); // Very light orange
  doc.setDrawColor(253, 186, 116); // Light orange border
  doc.roundedRect(margin, yPosition, contentWidth, 25, 2, 2, 'FD');
  
  yPosition += 6;
  addText('Immediate (24 hours):', 11, 'bold', colors.dark, 8, 4);
  addText('• Complete post-incident review and documentation\n• Implement immediate security patches or fixes', 10, 'normal', colors.dark, 8, 6);
  
  addText('Short-term (1-2 weeks):', 11, 'bold', colors.dark, 8, 4);
  addText('• Deploy preventive measures and system improvements\n• Update monitoring and alerting configurations\n• Conduct team training and knowledge transfer sessions', 10, 'normal', colors.dark, 8, 6);
  
  addText('Long-term (1-3 months):', 11, 'bold', colors.dark, 8, 4);
  addText('• Implement architectural changes and system redesign\n• Review and update all related policies and procedures\n• Conduct compliance audits and process assessments', 10, 'normal', colors.dark, 8, 12);

  // Lessons Learned & Recommendations
  addSectionHeader('LESSONS LEARNED & RECOMMENDATIONS', colors.success);
  
  addText('Key Insights:', 11, 'bold', colors.dark, 0, 4);
  addText(`This ${sop.incidentType} incident highlights the importance of proactive monitoring and rapid response capabilities. The ${sop.severity.toLowerCase()} severity classification requires enhanced preventive measures and system resilience improvements.`, 10, 'normal', colors.dark, 0, 8);
  
  addText('Strategic Recommendations:', 11, 'bold', colors.dark, 0, 4);
  addText('• Invest in automated monitoring and self-healing capabilities\n• Enhance cross-team collaboration and communication protocols\n• Regular disaster recovery testing and validation exercises\n• Continuous improvement of incident response procedures', 10, 'normal', colors.dark, 8, 8);
  
  addText('Risk Mitigation Priorities:', 11, 'bold', colors.dark, 0, 4);
  addText('• Address single points of failure in critical systems\n• Implement comprehensive backup and recovery solutions\n• Establish clear escalation paths and decision authorities\n• Maintain up-to-date documentation and runbooks', 10, 'normal', colors.dark, 8, 12);

  // Document Control & Approvals
  addSectionHeader('DOCUMENT CONTROL & APPROVALS', colors.secondary);
  
  checkPageSpace(35);
  doc.setFillColor(248, 250, 252); // Very light gray
  doc.setDrawColor(203, 213, 225); // Light gray border
  doc.roundedRect(margin, yPosition, contentWidth, 30, 2, 2, 'FD');
  
  yPosition += 6;
  addText('Document Information:', 11, 'bold', colors.dark, 8, 4);
  addText(`Version: 1.0 | Created: ${new Date(sop.createdAt).toLocaleDateString()} | Status: Active`, 10, 'normal', colors.dark, 8, 6);
  
  addText('Review & Approval Matrix:', 11, 'bold', colors.dark, 8, 4);
  addText('• Prepared by: Operations Team | Date: _______________', 10, 'normal', colors.dark, 8, 4);
  addText('• Reviewed by: Team Lead | Date: _______________', 10, 'normal', colors.dark, 8, 4);
  addText('• Approved by: Operations Manager | Date: _______________', 10, 'normal', colors.dark, 8, 6);
  
  addText('Next Review Date: ________________________', 10, 'bold', colors.dark, 8, 12);

  // Professional footer on all pages
  const addFooterToAllPages = () => {
    const pageCount = doc.internal.pages.length - 1;
    for (let i = 1; i <= pageCount; i++) {
      doc.setPage(i);
      
      // Footer line
      doc.setDrawColor(colors.light[0], colors.light[1], colors.light[2]);
      doc.setLineWidth(0.3);
      doc.line(margin, pageHeight - 18, pageWidth - margin, pageHeight - 18);
      
      // Footer text
      doc.setFontSize(8);
      doc.setFont('helvetica', 'normal');
      doc.setTextColor(colors.light[0], colors.light[1], colors.light[2]);
      
      doc.text(`sopify Enterprise Operations Platform - Standard Operating Procedure`, margin, pageHeight - 12);
      doc.text(`Page ${i} of ${pageCount}`, pageWidth - margin - 20, pageHeight - 12);
      doc.text(`Generated: ${new Date().toLocaleDateString()} | Classification: ${sop.severity.toUpperCase()}`, pageWidth - margin - 80, pageHeight - 8);
    }
  };

  addFooterToAllPages();

  const pdfBuffer = doc.output('arraybuffer');
  
  return new NextResponse(pdfBuffer, {
    headers: {
      'Content-Type': 'application/pdf',
      'Content-Disposition': `attachment; filename="SOP_${sop.title.replace(/[^a-z0-9]/gi, '_').toLowerCase()}_${new Date().getTime()}.pdf"`,
    },
  });
}

async function generateDOCX(sop: SOP, completedSteps: string[]) {
  const doc = new Document({
    sections: [
      {
        properties: {},
        children: [
          // Header
          new Paragraph({
            children: [new TextRun({ text: "sopify", bold: true, size: 32, color: "3B82F6" })],
            alignment: "left",
          }),
          new Paragraph({
            children: [new TextRun({ text: "Enterprise Operations Platform", size: 18, color: "6B7280" })],
            alignment: "left",
          }),
          
          // Document Classification
          new Paragraph({ children: [new TextRun({ text: "" })] }),
          new Paragraph({
            children: [new TextRun({ text: "STANDARD OPERATING PROCEDURE", bold: true, size: 20 })],
            heading: HeadingLevel.TITLE,
          }),
          new Paragraph({
            children: [new TextRun({ text: sop.title, bold: true, size: 28 })],
            heading: HeadingLevel.TITLE,
          }),

          // Classification Card
          new Paragraph({ children: [new TextRun({ text: "" })] }),
          new Paragraph({
            children: [new TextRun({ text: "INCIDENT CLASSIFICATION", bold: true, size: 20, color: "1E40AF" })],
          }),
          new Paragraph({
            children: [
              new TextRun({ text: `Incident Type: ${sop.incidentType} | `, bold: true }),
              new TextRun({ text: `Severity: ${sop.severity} | `, bold: true }),
              new TextRun({ text: `Status: ACTIVE`, bold: true, color: "059669" }),
            ],
          }),
          new Paragraph({
            children: [
              new TextRun({ text: `Primary Team: ${sop.responsibleTeam} | ` }),
              new TextRun({ text: `Generated: ${new Date(sop.createdAt).toLocaleString()} | ` }),
              new TextRun({ text: `Version: 1.0` }),
            ],
          }),

          // Executive Summary
          new Paragraph({ children: [new TextRun({ text: "" })] }),
          new Paragraph({
            children: [new TextRun({ text: "EXECUTIVE SUMMARY", bold: true, size: 24, color: "3B82F6" })],
            heading: HeadingLevel.HEADING_1,
          }),
          new Paragraph({
            children: [new TextRun({ 
              text: `This Standard Operating Procedure provides comprehensive guidelines for responding to and preventing incidents of type "${sop.incidentType}" with ${sop.severity.toLowerCase()} severity impact. The procedures outlined ensure systematic incident resolution, minimize operational disruption, and prevent future occurrences through structured preventive measures.`
            })],
          }),

          // Risk Assessment
          new Paragraph({ children: [new TextRun({ text: "" })] }),
          new Paragraph({
            children: [new TextRun({ text: "RISK ASSESSMENT & IMPACT ANALYSIS", bold: true, size: 24, color: "F59E0B" })],
            heading: HeadingLevel.HEADING_1,
          }),
          new Paragraph({
            children: [new TextRun({ 
              text: `Risk Level: ${sop.severity === 'High' ? 'CRITICAL' : sop.severity === 'Medium' ? 'MODERATE' : 'LOW'}`, 
              bold: true, 
              color: sop.severity === 'High' ? "EF4444" : sop.severity === 'Medium' ? "F59E0B" : "22C55E"
            })],
          }),
          new Paragraph({
            children: [new TextRun({ 
              text: `Business Impact: ${sop.severity} severity incidents of type "${sop.incidentType}" can significantly affect operational continuity, system availability, and business processes. Immediate response is critical to minimize downtime and prevent cascading failures.`
            })],
          }),

          // Problem/Trigger
          new Paragraph({ children: [new TextRun({ text: "" })] }),
          new Paragraph({
            children: [new TextRun({ text: "INCIDENT TRIGGER & PROBLEM STATEMENT", bold: true, size: 24, color: "EF4444" })],
            heading: HeadingLevel.HEADING_1,
          }),
          new Paragraph({
            children: [new TextRun({ text: "Primary Trigger:", bold: true })],
          }),
          new Paragraph({
            children: [new TextRun({ text: sop.trigger })],
          }),
          new Paragraph({
            children: [new TextRun({ text: "Detection Methods:", bold: true })],
          }),
          new Paragraph({
            children: [new TextRun({ 
              text: "• Automated monitoring alerts and system health checks\n• User reports and service desk notifications\n• Performance degradation indicators\n• System log analysis and error pattern recognition"
            })],
          }),

          // Immediate Actions
          new Paragraph({ children: [new TextRun({ text: "" })] }),
          new Paragraph({
            children: [new TextRun({ text: "IMMEDIATE RESPONSE ACTIONS (Phase 1)", bold: true, size: 24, color: "EF4444" })],
            heading: HeadingLevel.HEADING_1,
          }),
          new Paragraph({
            children: [new TextRun({ 
              text: `Execute these actions immediately upon incident detection. Time is critical for ${sop.severity.toLowerCase()} severity incidents.`, 
              italics: true 
            })],
          }),

          ...sop.immediateSteps.flatMap((step, index) => {
            const isCompleted = completedSteps.includes(step.id);
            return [
              new Paragraph({ children: [new TextRun({ text: "" })] }),
              new Paragraph({
                children: [
                  new TextRun({ 
                    text: `STEP ${index + 1}: ${step.title}${isCompleted ? ' ✓ COMPLETED' : ''}`, 
                    bold: true,
                    size: 22,
                    color: isCompleted ? "059669" : "1F2937"
                  }),
                ],
              }),
              new Paragraph({
                children: [new TextRun({ text: `Action Required: ${step.description}` })],
              }),
              new Paragraph({
                children: [new TextRun({ 
                  text: `Responsible: ${step.responsible || 'Operations Team'} | Duration: ${step.estimatedTime || 'TBD'} | Priority: ${step.priority?.toUpperCase() || 'HIGH'}`, 
                  italics: true,
                  color: "6B7280"
                })],
              }),
            ];
          }),

          // Escalation Procedures
          new Paragraph({ children: [new TextRun({ text: "" })] }),
          new Paragraph({
            children: [new TextRun({ text: "ESCALATION PROCEDURES", bold: true, size: 24, color: "6366F1" })],
            heading: HeadingLevel.HEADING_1,
          }),
          new Paragraph({
            children: [new TextRun({ text: "Level 1 Escalation (15 minutes):", bold: true })],
          }),
          new Paragraph({
            children: [new TextRun({ text: "• Notify team lead and senior operations staff\n• Activate backup systems if available\n• Initiate customer communication protocols" })],
          }),
          new Paragraph({
            children: [new TextRun({ text: "Level 2 Escalation (30 minutes):", bold: true })],
          }),
          new Paragraph({
            children: [new TextRun({ text: "• Contact executive leadership and incident commander\n• Engage external vendor support if required\n• Activate business continuity plans" })],
          }),

          // Preventive Measures
          new Paragraph({ children: [new TextRun({ text: "" })] }),
          new Paragraph({
            children: [new TextRun({ text: "PREVENTIVE MEASURES & LONG-TERM MITIGATION (Phase 2)", bold: true, size: 24, color: "F59E0B" })],
            heading: HeadingLevel.HEADING_1,
          }),
          new Paragraph({
            children: [new TextRun({ 
              text: "Implement these measures to prevent incident recurrence and strengthen system resilience:", 
              italics: true 
            })],
          }),

          ...sop.preventiveActions.flatMap((step, index) => {
            const isCompleted = completedSteps.includes(step.id);
            return [
              new Paragraph({ children: [new TextRun({ text: "" })] }),
              new Paragraph({
                children: [
                  new TextRun({ 
                    text: `PREVENTION ${index + 1}: ${step.title}${isCompleted ? ' ✓ COMPLETED' : ''}`, 
                    bold: true,
                    size: 22,
                    color: isCompleted ? "059669" : "1F2937"
                  }),
                ],
              }),
              new Paragraph({
                children: [new TextRun({ text: `Action Required: ${step.description}` })],
              }),
              new Paragraph({
                children: [new TextRun({ 
                  text: `Responsible: ${step.responsible || 'DevOps Team'} | Duration: ${step.estimatedTime || 'TBD'} | Priority: ${step.priority?.toUpperCase() || 'MEDIUM'}`, 
                  italics: true,
                  color: "6B7280"
                })],
              }),
            ];
          }),

          // Performance Metrics
          new Paragraph({ children: [new TextRun({ text: "" })] }),
          new Paragraph({
            children: [new TextRun({ text: "PERFORMANCE METRICS & SUCCESS CRITERIA", bold: true, size: 24, color: "22C55E" })],
            heading: HeadingLevel.HEADING_1,
          }),
          new Paragraph({
            children: [new TextRun({ text: "Key Performance Indicators:", bold: true })],
          }),
          new Paragraph({
            children: [new TextRun({ 
              text: `• Incident Resolution Time: ${sop.severity === 'High' ? '< 30 minutes' : sop.severity === 'Medium' ? '< 60 minutes' : '< 120 minutes'}\n• System Availability Target: ${sop.severity === 'High' ? '99.9%' : sop.severity === 'Medium' ? '99.5%' : '99.0%'}\n• Customer Impact: Minimize affected user count\n• Communication Response: < 5 minutes initial notification`
            })],
          }),

          // Document Control
          new Paragraph({ children: [new TextRun({ text: "" })] }),
          new Paragraph({
            children: [new TextRun({ text: "DOCUMENT CONTROL & APPROVALS", bold: true, size: 24, color: "6366F1" })],
            heading: HeadingLevel.HEADING_1,
          }),
          new Paragraph({
            children: [new TextRun({ 
              text: `Version: 1.0 | Created: ${new Date(sop.createdAt).toLocaleDateString()} | Status: Active | Classification: ${sop.severity.toUpperCase()}`
            })],
          }),
          new Paragraph({
            children: [new TextRun({ text: "Prepared by: Operations Team | Date: _______________" })],
          }),
          new Paragraph({
            children: [new TextRun({ text: "Reviewed by: Team Lead | Date: _______________" })],
          }),
          new Paragraph({
            children: [new TextRun({ text: "Approved by: Operations Manager | Date: _______________" })],
          }),
        ],
      },
    ],
  });

  const buffer = await Packer.toBuffer(doc);
  
  return new NextResponse(buffer, {
    headers: {
      'Content-Type': 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'Content-Disposition': `attachment; filename="${sop.title.replace(/[^a-z0-9]/gi, '_').toLowerCase()}.docx"`,
    },
  });
}

function generateHTML(sop: SOP, completedSteps: string[]) {
  const html = `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${sop.title}</title>
    <style>
        * { box-sizing: border-box; }
        body { 
            font-family: 'Inter', system-ui, -apple-system, sans-serif; 
            max-width: 1000px; 
            margin: 0 auto; 
            padding: 20px; 
            line-height: 1.6; 
            color: #1f2937;
            background: #f9fafb;
        }
        .header { 
            background: linear-gradient(135deg, #3b82f6, #6366f1); 
            color: white; 
            padding: 30px; 
            border-radius: 12px; 
            margin-bottom: 30px; 
            box-shadow: 0 10px 25px rgba(0,0,0,0.1);
        }
        .company-logo { font-size: 24px; font-weight: bold; margin-bottom: 10px; }
        .company-tagline { font-size: 14px; opacity: 0.9; margin-bottom: 20px; }
        .doc-type { font-size: 12px; text-transform: uppercase; letter-spacing: 1px; opacity: 0.8; }
        .title { font-size: 28px; margin: 8px 0 20px 0; font-weight: bold; }
        .classification-card { 
            background: rgba(255,255,255,0.1); 
            padding: 20px; 
            border-radius: 8px; 
            border: 1px solid rgba(255,255,255,0.2);
        }
        .metadata { font-size: 14px; line-height: 1.8; }
        .status-active { color: #10b981; font-weight: bold; }
        
        .section { 
            background: white; 
            margin: 30px 0; 
            border-radius: 12px; 
            overflow: hidden;
            box-shadow: 0 4px 12px rgba(0,0,0,0.05);
            border: 1px solid #e5e7eb;
        }
        .section-header { 
            padding: 20px 25px 15px; 
            border-bottom: 1px solid #e5e7eb;
        }
        .section-title { 
            font-size: 18px; 
            font-weight: bold; 
            margin: 0; 
            display: flex;
            align-items: center;
            gap: 8px;
        }
        .section-subtitle { 
            font-size: 14px; 
            color: #6b7280; 
            margin: 5px 0 0 0; 
            font-style: italic;
        }
        .section-content { padding: 25px; }
        
        .step-container { margin: 20px 0; }
        .step { 
            background: #f8fafc; 
            padding: 20px; 
            border-radius: 8px; 
            border-left: 4px solid #3b82f6;
            border: 1px solid #e2e8f0;
            transition: all 0.2s;
        }
        .step:hover { box-shadow: 0 2px 8px rgba(0,0,0,0.1); }
        .step.completed { 
            background: #f0fdf4; 
            border-left-color: #22c55e;
            border-color: #bbf7d0;
        }
        .step.immediate { border-left-color: #ef4444; }
        .step.preventive { border-left-color: #f59e0b; }
        .step.immediate.completed { background: #fef2f2; border-color: #fecaca; }
        .step.preventive.completed { background: #fffbeb; border-color: #fed7aa; }
        
        .step-header { 
            display: flex; 
            align-items: flex-start; 
            gap: 12px; 
            margin-bottom: 12px;
        }
        .step-checkbox { 
            width: 20px; 
            height: 20px; 
            margin-top: 2px;
            accent-color: #3b82f6;
        }
        .step-title { 
            font-weight: bold; 
            font-size: 16px; 
            margin: 0;
            flex: 1;
        }
        .step-description { 
            margin: 8px 0 15px 32px; 
            color: #374151;
            font-size: 15px;
        }
        .step-meta { 
            background: #f1f5f9; 
            padding: 10px 15px; 
            border-radius: 6px; 
            margin: 15px 0 0 32px;
            font-size: 13px; 
            color: #64748b;
            border: 1px solid #e2e8f0;
        }
        
        .info-box { 
            background: #eff6ff; 
            border: 1px solid #bfdbfe; 
            border-radius: 8px; 
            padding: 20px; 
            margin: 20px 0;
        }
        .warning-box { 
            background: #fffbeb; 
            border: 1px solid #fed7aa; 
            border-radius: 8px; 
            padding: 20px; 
            margin: 20px 0;
        }
        .success-box { 
            background: #f0fdf4; 
            border: 1px solid #bbf7d0; 
            border-radius: 8px; 
            padding: 20px; 
            margin: 20px 0;
        }
        
        .risk-level { 
            display: inline-block;
            padding: 4px 12px;
            border-radius: 20px;
            font-weight: bold;
            font-size: 12px;
            text-transform: uppercase;
            letter-spacing: 0.5px;
        }
        .risk-critical { background: #fecaca; color: #991b1b; }
        .risk-moderate { background: #fed7aa; color: #9a3412; }
        .risk-low { background: #bbf7d0; color: #166534; }
        
        .metrics-grid { 
            display: grid; 
            grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); 
            gap: 15px; 
            margin: 20px 0;
        }
        .metric-card { 
            background: #f8fafc; 
            padding: 15px; 
            border-radius: 8px; 
            border: 1px solid #e2e8f0;
            text-align: center;
        }
        .metric-value { font-size: 18px; font-weight: bold; color: #3b82f6; }
        .metric-label { font-size: 12px; color: #64748b; text-transform: uppercase; }
        
        .copy-section { 
            background: #f1f5f9; 
            border: 2px dashed #cbd5e1; 
            border-radius: 8px; 
            padding: 20px; 
            margin: 30px 0;
            text-align: center;
        }
        .copy-btn { 
            background: #3b82f6; 
            color: white; 
            border: none; 
            padding: 12px 24px; 
            border-radius: 6px; 
            cursor: pointer; 
            font-weight: bold;
            transition: background 0.2s;
        }
        .copy-btn:hover { background: #2563eb; }
        
        .footer { 
            margin-top: 50px; 
            padding: 20px; 
            text-align: center; 
            color: #6b7280; 
            font-size: 12px;
            border-top: 1px solid #e5e7eb;
        }
    </style>
</head>
<body>
    <div class="header">
        <div class="company-logo">sopify</div>
        <div class="company-tagline">Enterprise Operations Platform</div>
        <div class="doc-type">Standard Operating Procedure</div>
        <h1 class="title">${sop.title}</h1>
        <div class="classification-card">
            <div class="metadata">
                <strong>Incident Type:</strong> ${sop.incidentType} | 
                <strong>Severity:</strong> ${sop.severity} | 
                <span class="status-active">Status: ACTIVE</span><br>
                <strong>Primary Team:</strong> ${sop.responsibleTeam} | 
                <strong>Generated:</strong> ${new Date(sop.createdAt).toLocaleString()} | 
                <strong>Version:</strong> 1.0
            </div>
        </div>
    </div>

    <div class="section">
        <div class="section-header">
            <h2 class="section-title">Executive Summary</h2>
        </div>
        <div class="section-content">
            <p>This Standard Operating Procedure provides comprehensive guidelines for responding to and preventing incidents of type "${sop.incidentType}" with ${sop.severity.toLowerCase()} severity impact. The procedures outlined ensure systematic incident resolution, minimize operational disruption, and prevent future occurrences through structured preventive measures.</p>
        </div>
    </div>

    <div class="section">
        <div class="section-header">
            <h2 class="section-title">Risk Assessment & Impact Analysis</h2>
        </div>
        <div class="section-content">
            <div class="risk-level ${sop.severity === 'High' ? 'risk-critical' : sop.severity === 'Medium' ? 'risk-moderate' : 'risk-low'}">
                Risk Level: ${sop.severity === 'High' ? 'CRITICAL' : sop.severity === 'Medium' ? 'MODERATE' : 'LOW'}
            </div>
            <div class="info-box">
                <strong>Business Impact:</strong> ${sop.severity} severity incidents of type "${sop.incidentType}" can significantly affect operational continuity, system availability, and business processes. Immediate response is critical to minimize downtime and prevent cascading failures.
            </div>
        </div>
    </div>

    <div class="section">
        <div class="section-header">
            <h2 class="section-title">Incident Trigger & Problem Statement</h2>
        </div>
        <div class="section-content">
            <div class="warning-box">
                <strong>Primary Trigger:</strong><br>
                ${sop.trigger}
            </div>
            <strong>Detection Methods:</strong>
            <ul>
                <li>Automated monitoring alerts and system health checks</li>
                <li>User reports and service desk notifications</li>
                <li>Performance degradation indicators</li>
                <li>System log analysis and error pattern recognition</li>
            </ul>
        </div>
    </div>

    <div class="section">
        <div class="section-header">
            <h2 class="section-title">Immediate Response Actions (Phase 1)</h2>
            <p class="section-subtitle">Execute these actions immediately upon incident detection. Time is critical for ${sop.severity.toLowerCase()} severity incidents.</p>
        </div>
        <div class="section-content">
            ${sop.immediateSteps.map((step, index) => {
              const isCompleted = completedSteps.includes(step.id);
              return `
                <div class="step-container">
                    <div class="step immediate ${isCompleted ? 'completed' : ''}" data-step-id="${step.id}">
                        <div class="step-header">
                            <input type="checkbox" class="step-checkbox" ${isCompleted ? 'checked' : ''} onchange="toggleStep('${step.id}')">
                            <h3 class="step-title">STEP ${index + 1}: ${step.title}${isCompleted ? ' ✓ COMPLETED' : ''}</h3>
                        </div>
                        <div class="step-description"><strong>Action Required:</strong> ${step.description}</div>
                        <div class="step-meta">
                            <strong>Responsible:</strong> ${step.responsible || 'Operations Team'} | 
                            <strong>Duration:</strong> ${step.estimatedTime || 'TBD'} | 
                            <strong>Priority:</strong> ${step.priority?.toUpperCase() || 'HIGH'}
                        </div>
                    </div>
                </div>
              `;
            }).join('')}
        </div>
    </div>

    <div class="section">
        <div class="section-header">
            <h2 class="section-title">Escalation Procedures</h2>
        </div>
        <div class="section-content">
            <div class="step-container">
                <div class="info-box">
                    <strong>Level 1 Escalation (15 minutes):</strong><br>
                    • Notify team lead and senior operations staff<br>
                    • Activate backup systems if available<br>
                    • Initiate customer communication protocols
                </div>
                <div class="warning-box">
                    <strong>Level 2 Escalation (30 minutes):</strong><br>
                    • Contact executive leadership and incident commander<br>
                    • Engage external vendor support if required<br>
                    • Activate business continuity plans
                </div>
            </div>
        </div>
    </div>

    <div class="section">
        <div class="section-header">
            <h2 class="section-title">Preventive Measures & Long-term Mitigation (Phase 2)</h2>
            <p class="section-subtitle">Implement these measures to prevent incident recurrence and strengthen system resilience.</p>
        </div>
        <div class="section-content">
            ${sop.preventiveActions.map((step, index) => {
              const isCompleted = completedSteps.includes(step.id);
              return `
                <div class="step-container">
                    <div class="step preventive ${isCompleted ? 'completed' : ''}" data-step-id="${step.id}">
                        <div class="step-header">
                            <input type="checkbox" class="step-checkbox" ${isCompleted ? 'checked' : ''} onchange="toggleStep('${step.id}')">
                            <h3 class="step-title">PREVENTION ${index + 1}: ${step.title}${isCompleted ? ' ✓ COMPLETED' : ''}</h3>
                        </div>
                        <div class="step-description"><strong>Action Required:</strong> ${step.description}</div>
                        <div class="step-meta">
                            <strong>Responsible:</strong> ${step.responsible || 'DevOps Team'} | 
                            <strong>Duration:</strong> ${step.estimatedTime || 'TBD'} | 
                            <strong>Priority:</strong> ${step.priority?.toUpperCase() || 'MEDIUM'}
                        </div>
                    </div>
                </div>
              `;
            }).join('')}
        </div>
    </div>

    <div class="section">
        <div class="section-header">
            <h2 class="section-title">📊 Performance Metrics & Success Criteria</h2>
        </div>
        <div class="section-content">
            <div class="metrics-grid">
                <div class="metric-card">
                    <div class="metric-value">${sop.severity === 'High' ? '< 30 min' : sop.severity === 'Medium' ? '< 60 min' : '< 120 min'}</div>
                    <div class="metric-label">Resolution Target</div>
                </div>
                <div class="metric-card">
                    <div class="metric-value">${sop.severity === 'High' ? '99.9%' : sop.severity === 'Medium' ? '99.5%' : '99.0%'}</div>
                    <div class="metric-label">Availability Target</div>
                </div>
                <div class="metric-card">
                    <div class="metric-value">< 5 min</div>
                    <div class="metric-label">Communication Response</div>
                </div>
            </div>
            <div class="success-box">
                <strong>Success Criteria:</strong><br>
                • Incident fully resolved within target timeframe<br>
                • No data loss or corruption occurred<br>
                • All affected services restored to normal operation<br>
                • Root cause identified and documented<br>
                • Preventive measures implemented and verified
            </div>
        </div>
    </div>

    <div class="copy-section">
        <h3>Copy SOP to Clipboard</h3>
        <p>Click the button below to copy this entire SOP as formatted text:</p>
        <button class="copy-btn" onclick="copySOPToClipboard()">Copy Full SOP to Clipboard</button>
        <div id="copy-status" style="margin-top: 10px; font-size: 14px;"></div>
    </div>

    <div class="footer">
        <div>sopify Enterprise Operations Platform - Standard Operating Procedure</div>
        <div>Generated: ${new Date().toLocaleDateString()} | Classification: ${sop.severity.toUpperCase()} | Version: 1.0</div>
    </div>

    <script>
        function toggleStep(stepId) {
            const checkbox = event.target;
            const step = checkbox.closest('.step');
            if (checkbox.checked) {
                step.classList.add('completed');
                // Update step title to show completion
                const title = step.querySelector('.step-title');
                if (!title.textContent.includes('✓ COMPLETED')) {
                    title.textContent = title.textContent.replace(/$/g, ' ✓ COMPLETED');
                }
            } else {
                step.classList.remove('completed');
                // Remove completion marker from title
                const title = step.querySelector('.step-title');
                title.textContent = title.textContent.replace(' ✓ COMPLETED', '');
            }
        }

        function copySOPToClipboard() {
            const statusDiv = document.getElementById('copy-status');
            
            // Create formatted text content using string concatenation
            let sopText = 'STANDARD OPERATING PROCEDURE\\n';
            sopText += sop.title + '\\n\\n';
            sopText += 'INCIDENT CLASSIFICATION\\n';
            sopText += 'Type: ' + sop.incidentType + ' | Severity: ' + sop.severity + ' | Status: ACTIVE\\n';
            sopText += 'Primary Team: ' + sop.responsibleTeam + '\\n';
            sopText += 'Generated: ' + new Date(sop.createdAt).toLocaleString() + '\\n\\n';
            sopText += 'EXECUTIVE SUMMARY\\n';
            sopText += 'This Standard Operating Procedure provides comprehensive guidelines for responding to and preventing incidents of type "' + sop.incidentType + '" with ' + sop.severity.toLowerCase() + ' severity impact.\\n\\n';
            sopText += 'INCIDENT TRIGGER & PROBLEM STATEMENT\\n';
            sopText += 'Primary Trigger: ' + sop.trigger + '\\n\\n';
            sopText += 'IMMEDIATE RESPONSE ACTIONS (Phase 1)\\n';
            sop.immediateSteps.forEach((step, index) => {
                sopText += 'STEP ' + (index + 1) + ': ' + step.title + '\\n';
                sopText += 'Action Required: ' + step.description + '\\n';
                sopText += 'Responsible: ' + (step.responsible || 'Operations Team') + ' | Duration: ' + (step.estimatedTime || 'TBD') + ' | Priority: ' + (step.priority || 'HIGH').toUpperCase() + '\\n\\n';
            });
            sopText += 'PREVENTIVE MEASURES & LONG-TERM MITIGATION (Phase 2)\\n';
            sop.preventiveActions.forEach((step, index) => {
                sopText += 'PREVENTION ' + (index + 1) + ': ' + step.title + '\\n';
                sopText += 'Action Required: ' + step.description + '\\n';
                sopText += 'Responsible: ' + (step.responsible || 'DevOps Team') + ' | Duration: ' + (step.estimatedTime || 'TBD') + ' | Priority: ' + (step.priority || 'MEDIUM').toUpperCase() + '\\n\\n';
            });
            sopText += 'PERFORMANCE METRICS\\n';
            sopText += '• Resolution Target: ' + (sop.severity === 'High' ? '< 30 minutes' : sop.severity === 'Medium' ? '< 60 minutes' : '< 120 minutes') + '\\n';
            sopText += '• Availability Target: ' + (sop.severity === 'High' ? '99.9%' : sop.severity === 'Medium' ? '99.5%' : '99.0%') + '\\n';
            sopText += '• Communication Response: < 5 minutes\\n\\n';
            sopText += 'Generated by sopify Enterprise Operations Platform';

            navigator.clipboard.writeText(sopText).then(function() {
                statusDiv.innerHTML = '<span style="color: #22c55e; font-weight: bold;">✓ SOP copied to clipboard successfully!</span>';
                setTimeout(() => {
                    statusDiv.innerHTML = '';
                }, 3000);
            }, function(err) {
                statusDiv.innerHTML = '<span style="color: #ef4444; font-weight: bold;">✗ Failed to copy to clipboard. Please copy manually.</span>';
                console.error('Could not copy text: ', err);
            });
        }
    </script>
</body>
</html>`;

  return new NextResponse(html, {
    headers: {
      'Content-Type': 'text/html',
      'Content-Disposition': `attachment; filename="${sop.title.replace(/[^a-z0-9]/gi, '_').toLowerCase()}.html"`,
    },
  });
}

function generateClipboardText(sop: SOP, completedSteps: string[]) {
  // Build comprehensive clipboard text with proper string concatenation
  const separator = '━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━';
  
  let text = 'STANDARD OPERATING PROCEDURE\n';
  text += sop.title + '\n\n';
  
  // Incident Classification
  text += 'INCIDENT CLASSIFICATION\n';
  text += separator + '\n';
  text += `Type: ${sop.incidentType} | Severity: ${sop.severity} | Status: ACTIVE\n`;
  text += `Primary Team: ${sop.responsibleTeam}\n`;
  text += `Generated: ${new Date(sop.createdAt).toLocaleString()} | Version: 1.0\n\n`;
  
  // Executive Summary
  text += 'EXECUTIVE SUMMARY\n';
  text += separator + '\n';
  text += `This Standard Operating Procedure provides comprehensive guidelines for responding to and preventing incidents of type "${sop.incidentType}" with ${sop.severity.toLowerCase()} severity impact. The procedures outlined ensure systematic incident resolution, minimize operational disruption, and prevent future occurrences through structured preventive measures.\n\n`;
  
  // Risk Assessment
  text += 'RISK ASSESSMENT & IMPACT ANALYSIS\n';
  text += separator + '\n';
  text += `Risk Level: ${sop.severity === 'High' ? 'CRITICAL' : sop.severity === 'Medium' ? 'MODERATE' : 'LOW'}\n`;
  text += `Business Impact: ${sop.severity} severity incidents can significantly affect operational continuity, system availability, and business processes.\n\n`;
  
  // Incident Trigger
  text += 'INCIDENT TRIGGER & PROBLEM STATEMENT\n';
  text += separator + '\n';
  text += 'PRIMARY TRIGGER:\n';
  text += sop.trigger + '\n\n';
  text += 'DETECTION METHODS:\n';
  text += '• Automated monitoring alerts and system health checks\n';
  text += '• User reports and service desk notifications\n';
  text += '• Performance degradation indicators\n';
  text += '• System log analysis and error pattern recognition\n\n';
  
  // Immediate Actions
  text += 'IMMEDIATE RESPONSE ACTIONS (Phase 1)\n';
  text += separator + '\n';
  text += `Execute immediately upon incident detection. Time critical for ${sop.severity.toLowerCase()} severity incidents.\n\n`;
  
  sop.immediateSteps.forEach((step, index) => {
    const isCompleted = completedSteps.includes(step.id);
    text += `STEP ${index + 1}: ${step.title}${isCompleted ? ' ✓ COMPLETED' : ''}\n`;
    text += `   Action Required: ${step.description}\n`;
    text += `   Responsible: ${step.responsible || 'Operations Team'}\n`;
    text += `   Duration: ${step.estimatedTime || 'TBD'}\n`;
    text += `   Priority: ${(step.priority || 'HIGH').toUpperCase()}\n\n`;
  });
  
  // Escalation Procedures
  text += 'ESCALATION PROCEDURES\n';
  text += separator + '\n';
  text += 'Level 1 Escalation (15 minutes):\n';
  text += '   • Notify team lead and senior operations staff\n';
  text += '   • Activate backup systems if available\n';
  text += '   • Initiate customer communication protocols\n\n';
  text += 'Level 2 Escalation (30 minutes):\n';
  text += '   • Contact executive leadership and incident commander\n';
  text += '   • Engage external vendor support if required\n';
  text += '   • Activate business continuity plans\n\n';
  
  // Preventive Measures
  text += 'PREVENTIVE MEASURES & LONG-TERM MITIGATION (Phase 2)\n';
  text += separator + '\n';
  text += 'Implement these measures to prevent incident recurrence and strengthen system resilience.\n\n';
  
  sop.preventiveActions.forEach((step, index) => {
    const isCompleted = completedSteps.includes(step.id);
    text += `PREVENTION ${index + 1}: ${step.title}${isCompleted ? ' ✓ COMPLETED' : ''}\n`;
    text += `   Action Required: ${step.description}\n`;
    text += `   Responsible: ${step.responsible || 'DevOps Team'}\n`;
    text += `   Duration: ${step.estimatedTime || 'TBD'}\n`;
    text += `   Priority: ${(step.priority || 'MEDIUM').toUpperCase()}\n\n`;
  });
  
  // Performance Metrics
  text += 'PERFORMANCE METRICS & SUCCESS CRITERIA\n';
  text += separator + '\n';
  text += 'Key Performance Indicators:\n';
  text += `• Incident Resolution Time: ${sop.severity === 'High' ? '< 30 minutes' : sop.severity === 'Medium' ? '< 60 minutes' : '< 120 minutes'}\n`;
  text += `• System Availability Target: ${sop.severity === 'High' ? '99.9%' : sop.severity === 'Medium' ? '99.5%' : '99.0%'}\n`;
  text += '• Customer Impact: Minimize affected user count\n';
  text += '• Communication Response: < 5 minutes initial notification\n\n';
  text += 'SUCCESS CRITERIA:\n';
  text += '• Incident fully resolved within target timeframe\n';
  text += '• No data loss or corruption occurred\n';
  text += '• All affected services restored to normal operation\n';
  text += '• Root cause identified and documented\n';
  text += '• Preventive measures implemented and verified\n\n';
  
  // Document Control
  text += 'DOCUMENT CONTROL & APPROVALS\n';
  text += separator + '\n';
  text += 'Document Information:\n';
  text += `Version: 1.0 | Created: ${new Date(sop.createdAt).toLocaleDateString()} | Status: Active\n\n`;
  text += 'Review & Approval Matrix:\n';
  text += '• Prepared by: Operations Team | Date: _______________\n';
  text += '• Reviewed by: Team Lead | Date: _______________\n';
  text += '• Approved by: Operations Manager | Date: _______________\n\n';
  text += 'Next Review Date: ________________________\n\n';
  text += 'Generated by sopify Enterprise Operations Platform';

  return new NextResponse(JSON.stringify({ text }), {
    headers: {
      'Content-Type': 'application/json',
    },
  });
}
