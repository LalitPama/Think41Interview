const express = require('express');
const app = express();

app.use(express.json());
let workflows = {}; // {id: {str_id: string, name: string}}
let steps = {};     // {id: {str_id: string, workflow_id: number, description: string}}
let dependencies = {}; // {id: {step_id: number, prerequisite_step_id: number}}
let nextWorkflowId = 1;
let nextStepId = 1;
let nextDependencyId = 1;

app.post('/workflows', (req, res) => {
    const { workflow_str_id, name } = req.body;

    workflows[nextWorkflowId] = { str_id: workflow_str_id, name };
    const response = {
        internal_db_id: nextWorkflowId,
        workflow_str_id,
        status: 'created'
    };
    nextWorkflowId++;
    res.status(201).json(response);
});

app.post('/workflows/:workflow_str_id/steps', (req, res) => {
    const { workflow_str_id } = req.params;
    const { step_str_id, description } = req.body;

    const workflowId = Object.keys(workflows).find(id => workflows[id].str_id === workflow_str_id);
    if (!workflowId) {
        return res.status(404).json({ error: 'Workflow not found' });
    }

    steps[nextStepId] = { str_id: step_str_id, workflow_id: parseInt(workflowId), description };
    const response = {
        internal_db_id: nextStepId,
        step_str_id,
        status: 'step_added'
    };
    nextStepId++;
    res.status(201).json(response);
});

app.post('/workflows/:workflow_str_id/dependencies', (req, res) => {
    const { workflow_str_id } = req.params;
    const { step_str_id, prerequisite_step_str_id } = req.body;

    const workflowId = Object.keys(workflows).find(id => workflows[id].str_id === workflow_str_id);
    if (!workflowId) {
        return res.status(404).json({ error: 'Workflow not found' });
    }

    const stepId = Object.keys(steps).find(id => steps[id].str_id === step_str_id && steps[id].workflow_id === parseInt(workflowId));
    const prerequisiteStepId = Object.keys(steps).find(id => steps[id].str_id === prerequisite_step_str_id && steps[id].workflow_id === parseInt(workflowId));

    if (!stepId || !prerequisiteStepId) {
        return res.status(400).json({ error: 'Step not found or invalid' });
    }

    dependencies[nextDependencyId] = { step_id: parseInt(stepId), prerequisite_step_id: parseInt(prerequisiteStepId) };
    const response = {
        status: 'dependency_added'
    };
    nextDependencyId++;
    res.status(201).json(response);
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});