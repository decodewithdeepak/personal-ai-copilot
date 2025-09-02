const pool = require('../database/connection');

class PlannerAgent {
  constructor(model) {
    this.model = model;
    this.name = 'Planner Agent';
    this.role = 'Task Analysis and Priority Optimization';
    this.status = 'active';
    console.log('📅 Planner Agent initialized');
  }

  async analyzeDailyPriorities(userId) {
    try {
      console.log('📊 Planner Agent analyzing daily priorities...');
      
      // Get user's tasks from database
      const tasks = await this.getUserTasks(userId);
      const upcomingDeadlines = await this.getUpcomingDeadlines(userId);
      
      // Analyze with AI
      const analysis = await this.analyzeTaskPriorities(tasks, upcomingDeadlines);
      
      return {
        totalTasks: tasks.length,
        highPriority: tasks.filter(t => t.priority === 'high').length,
        upcomingDeadlines: upcomingDeadlines.length,
        recommendations: analysis.recommendations,
        priorityMatrix: analysis.priorityMatrix,
        timeAllocation: analysis.timeAllocation,
        urgentActions: analysis.urgentActions
      };
    } catch (error) {
      console.error('❌ Planner Agent error:', error);
      throw error;
    }
  }

  async optimizeTaskSchedule(userId) {
    try {
      console.log('⚡ Planner Agent optimizing task schedule...');
      
      const tasks = await this.getUserTasks(userId);
      const currentTime = new Date();
      const workingHours = this.getWorkingHours();
      
      const optimizationPrompt = `
        As a productivity expert, analyze these tasks and create an optimized daily schedule:
        
        Current Tasks:
        ${tasks.map(task => `- ${task.title} (Priority: ${task.priority}, Status: ${task.status})`).join('\n')}
        
        Current Time: ${currentTime.toLocaleString()}
        Working Hours: ${workingHours.start} - ${workingHours.end}
        
        Provide:
        1. Priority ranking with reasoning
        2. Optimal time slots for each task
        3. Productivity tips
        4. Potential conflicts or bottlenecks
        5. Energy management suggestions
        
        Format as JSON with clear structure.
      `;

      const result = await this.model.generateContent(optimizationPrompt);
      const optimizedSchedule = this.parseAIResponse(result.response.text());
      
      return {
        schedule: optimizedSchedule,
        tasks: tasks,
        optimization_applied: true,
        energy_mapping: this.getEnergyMapping(),
        break_suggestions: this.getBreakSuggestions()
      };
    } catch (error) {
      console.error('❌ Task optimization error:', error);
      throw error;
    }
  }

  async analyzeTaskPriorities(tasks, deadlines) {
    const priorityPrompt = `
      Analyze these tasks and upcoming deadlines to provide strategic recommendations:
      
      Tasks: ${JSON.stringify(tasks, null, 2)}
      Deadlines: ${JSON.stringify(deadlines, null, 2)}
      
      Provide analysis including:
      1. Priority matrix (urgent/important quadrants)
      2. Time allocation recommendations
      3. Urgent actions for today
      4. Strategic recommendations
      5. Risk assessment for delayed tasks
      
      Return as structured JSON.
    `;

    const result = await this.model.generateContent(priorityPrompt);
    return this.parseAIResponse(result.response.text());
  }

  async getUserTasks(userId) {
    try {
      const query = 'SELECT * FROM tasks WHERE user_id = $1 ORDER BY created_at DESC';
      const result = await pool.query(query, [userId]);
      return result.rows;
    } catch (error) {
      console.error('Database error getting tasks:', error);
      return [];
    }
  }

  async getUpcomingDeadlines(userId) {
    try {
      const query = `
        SELECT * FROM tasks 
        WHERE user_id = $1 
        AND due_date IS NOT NULL 
        AND due_date > NOW() 
        AND due_date <= NOW() + INTERVAL '7 days'
        ORDER BY due_date ASC
      `;
      const result = await pool.query(query, [userId]);
      return result.rows;
    } catch (error) {
      console.error('Database error getting deadlines:', error);
      return [];
    }
  }

  getWorkingHours() {
    return {
      start: '09:00',
      end: '17:00',
      timezone: 'local'
    };
  }

  getEnergyMapping() {
    return {
      morning: { energy: 'high', recommended: ['creative_work', 'complex_analysis'] },
      afternoon: { energy: 'medium', recommended: ['meetings', 'collaboration'] },
      evening: { energy: 'low', recommended: ['administrative', 'planning'] }
    };
  }

  getBreakSuggestions() {
    return [
      { duration: 15, activity: 'short_walk', frequency: 'every_2_hours' },
      { duration: 30, activity: 'lunch_break', frequency: 'midday' },
      { duration: 5, activity: 'deep_breathing', frequency: 'hourly' }
    ];
  }

  parseAIResponse(text) {
    try {
      // Clean the response and extract JSON
      const cleanText = text.replace(/```json|```/g, '').trim();
      return JSON.parse(cleanText);
    } catch (error) {
      console.warn('Failed to parse AI response as JSON, returning raw text');
      return { raw_response: text, parsed: false };
    }
  }

  getStatus() {
    return {
      name: this.name,
      role: this.role,
      status: this.status,
      capabilities: [
        'task_prioritization',
        'schedule_optimization',
        'deadline_analysis',
        'productivity_recommendations'
      ]
    };
  }
}

module.exports = PlannerAgent;
