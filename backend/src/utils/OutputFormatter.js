class OutputFormatter {
    static formatForAPI(content) {
        // Clean content for API responses
        return content
            .replace(/\*\*/g, '') // Remove markdown bold
            .replace(/\*/g, '')   // Remove markdown emphasis
            .replace(/#{1,6}\s*/g, '') // Remove markdown headers
            .replace(/\n{3,}/g, '\n\n') // Reduce multiple newlines
            .replace(/^\s+|\s+$/g, '') // Trim whitespace
            .replace(/\n\s*\n\s*\n/g, '\n\n'); // Clean up spacing
    }

    static formatForDisplay(content) {
        // Format content for frontend display with proper HTML
        return content
            .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>') // Bold text
            .replace(/\*(.*?)\*/g, '<em>$1</em>') // Italic text
            .replace(/#{3}\s*(.*?)$/gm, '<h3>$1</h3>') // H3 headers
            .replace(/#{2}\s*(.*?)$/gm, '<h2>$1</h2>') // H2 headers
            .replace(/#{1}\s*(.*?)$/gm, '<h1>$1</h1>') // H1 headers
            .replace(/\n/g, '<br>') // Line breaks
            .replace(/(<br>){3,}/g, '<br><br>'); // Clean up multiple breaks
    }

    static formatForPlainText(content) {
        // Clean plain text format
        return content
            .replace(/\*\*/g, '') // Remove markdown bold
            .replace(/\*/g, '')   // Remove markdown emphasis  
            .replace(/#{1,6}\s*/g, '') // Remove markdown headers
            .replace(/\n{3,}/g, '\n\n') // Reduce multiple newlines
            .replace(/^\s+|\s+$/g, '') // Trim whitespace
            .split('\n')
            .map(line => line.trim())
            .filter(line => line.length > 0)
            .join('\n');
    }

    static createCleanBriefing(briefingData) {
        const cleanContent = this.formatForPlainText(briefingData);

        // Structure the briefing properly
        const sections = cleanContent.split(/(?=(?:Good Morning|Today's Priorities|Strategic Focus|External Context|Action Items|Productivity))/i);

        const formattedSections = sections.map(section => {
            return section.trim();
        }).filter(section => section.length > 0);

        return formattedSections.join('\n\n');
    }

    static formatBriefingResponse(briefing, metadata = {}) {
        return {
            content: this.formatForPlainText(briefing),
            formatted_content: this.formatForDisplay(briefing),
            plain_text: this.createCleanBriefing(briefing),
            metadata: {
                generated_at: new Date().toISOString(),
                word_count: briefing.split(/\s+/).length,
                ...metadata
            }
        };
    }
}

module.exports = OutputFormatter;
