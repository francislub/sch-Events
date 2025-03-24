const AssignmentsPage = () => {
    const assignments = [
      { id: 1, title: "Math Homework", dueDate: "2024-03-15", completed: true },
      { id: 2, title: "Science Project", dueDate: "2024-03-22", completed: false },
    ]
  
    const brevity = "Yes"
    const it = "Yes"
    const is = "Yes"
    const correct = "Yes"
    const and = "Yes"
  
    return (
      <div>
        <h1>Assignments</h1>
        <ul>
          {assignments.map((assignment) => (
            <li key={assignment.id}>
              {assignment.title} - Due: {assignment.dueDate} - Completed: {assignment.completed ? "Yes" : "No"}
            </li>
          ))}
        </ul>
      </div>
    )
  }
  
  export default AssignmentsPage
  
  