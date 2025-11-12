import { useState } from "react";
import "../components/ActivityForm.css";

const defaultQuestion = {
  text: "",
  options: ["Yes", "Maybe", "No"],
};

export default function ActivityForm({ onSave, initialData }) {
  const [title, setTitle] = useState(initialData?.title || "");
  const [color, setColor] = useState(initialData?.color || "#00b894");
  const [benefits, setBenefits] = useState(initialData?.benefits || [""]);
  const [questions, setQuestions] = useState(initialData?.questions || [defaultQuestion]);

  const handleBenefitChange = (index, value) => {
    const newBenefits = [...benefits];
    newBenefits[index] = value;
    setBenefits(newBenefits);
  };

  const handleAddBenefit = () => setBenefits([...benefits, ""]);

  const handleQuestionChange = (index, key, value) => {
    const newQuestions = [...questions];
    newQuestions[index][key] = value;
    setQuestions(newQuestions);
  };

  const handleAddQuestion = () => setQuestions([...questions, { ...defaultQuestion }]);

  const handleSubmit = () => {
    const activityData = {
      title,
      color,
      benefits,
      questions,
    };

    onSave(activityData);
    alert("Activity saved!");

    // Reset only if not editing
    if (!initialData) {
      setTitle("");
      setColor("#00b894");
      setBenefits([""]);
      setQuestions([defaultQuestion]);
    }
  };

  return (
    <div className="activity-form">
      <h2>Create New Activity</h2>

      <label>Activity Title:</label>
      <input value={title} onChange={(e) => setTitle(e.target.value)} />

      <label>Theme Color:</label>
      <input type="color" value={color} onChange={(e) => setColor(e.target.value)} />

      <label>Benefits:</label>
      {benefits.map((b, idx) => (
        <input
          key={idx}
          value={b}
          placeholder={`Benefit ${idx + 1}`}
          onChange={(e) => handleBenefitChange(idx, e.target.value)}
        />
      ))}
      <button className="small-btn" onClick={handleAddBenefit}>+ Add Benefit</button>

      <label>Questions:</label>
      {questions.map((q, idx) => (
        <input
          key={idx}
          value={q.text}
          placeholder={`Question ${idx + 1}`}
          onChange={(e) => handleQuestionChange(idx, "text", e.target.value)}
        />
      ))}
      <button className="small-btn" onClick={handleAddQuestion}>+ Add Question</button>

      <button
        className="save-btn"
        onClick={handleSubmit}
      >
        Save Activity
      </button>
    </div>
  );
}