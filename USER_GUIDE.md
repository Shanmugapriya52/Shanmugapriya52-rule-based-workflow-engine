# User Guide: Workflow Automation System

Welcome to the Halleyx Workflow Automation System. This guide will help you create a workflow, manage users, and configure automation rules.

## 1. User Management
Before executing workflows, you should set up your users.
- Go to the **Role Management** page.
- Create users for different roles: `Administrator`, `Manager`, `User`.
- Use the **Key Icon** to see login credentials (passwords are stored as plain text for this challenge).

## 2. Creating a Workflow
1. Go to **Workflows** → **Create Workflow**.
2. Give it a name (e.g., "Expense Approval").
3. Define the **Input Schema** in JSON format:
   ```json
   {
     "fields": [
       { "name": "amount", "type": "number", "required": true },
       { "name": "reason", "type": "string" }
     ]
   }
   ```
4. Save identifying information.
5. In the **Step Editor**, add steps:
   - **Step 1 (Task)**: "Initial Review"
   - **Step 2 (Approval)**: "Manager Approval"
   - **Step 3 (Notification)**: "Success Email"
6. In the **Rule Editor**, define conditions:
   - For "Initial Review": 
     - Rule 1: `amount > 1000` → Go to "Manager Approval"
     - Rule 2: `amount <= 1000` → Go to "Success Email"
   - *Ensure you mark the Workflow as **Active** and set the **Start Step**.*

## 3. Executing a Workflow
- Click **Execute Workflow** on the dashboard or workflow list.
- Enter the required data (e.g., `amount: 1500`).
- Watch the live execution logs.
- If it reaches an **Approval** step, the workflow will pause.

## 4. Managing Approvals
- Go to the **Approval Page** or check the **Dashboard**.
- Pending approvals will appear there.
- Click **Approve** or **Reject**. The workflow will resume and evaluate rules based on your choice.

## 5. Automation Rules
- Use the **Automation Rules** page to set up global behaviors.
- Use templates like "Workflow Approval Required" to automatically notify relevant parties when certain triggers occur.

## 6. Audit & Logs
- Check the **Audit Log** for a system-wide history of all executions.
- Check **Execution Logs** for detailed step-by-step evaluation of a specific run.

---
**Quick Test Tip**: Create a simple workflow with a single rule `amount > 500` pointing to an approval step to see the pause/resume logic immediately.
