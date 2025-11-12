// Activity.js
import React, { useState, useEffect, useRef } from "react";
import "./Activity.css";
import { db } from "../firebase";
import {
  collection,
  onSnapshot,
  addDoc,
  updateDoc,
  deleteDoc,
  doc,
  serverTimestamp,
  query,
  orderBy,
} from "firebase/firestore";

const defaultQuestion = { text: "", options: ["Yes", "Maybe", "No"] };
const pastelGreens = [
  "#A8E6CF","#DCECC9","#C7CEEA","#D0F4DE","#F4C2C2","#C8E6C9","#A7C7E7","#B5EAD7","#D5ECC2",
];

function HowMuchModal({ onConfirm, onCancel }) {
  const [value, setValue] = useState(50);
  return (
    <div className="modalBackdrop">
      <div className="modal">
        <h3>How much?</h3>
        <input type="range" min="0" max="100" value={value} onChange={(e)=>setValue(e.target.value)} style={{width:"100%", marginBottom:15}} />
        <p>{value}%</p>
        <button onClick={()=>onConfirm(value)} className="confirmBtn">Confirm</button>
        <button onClick={onCancel} className="cancelBtn">Cancel</button>
      </div>
    </div>
  );
}

function ResultModal({ quote, questions, answers, onClose }) {
  return (
    <div className="modalBackdrop">
      <div className="modal">
        <h3 style={{ color: "#9EC7C9" }}>Result</h3>
        <div className="qaSummary" style={{ marginTop: 10 }}>
          <h4>Questions & Your Answers:</h4>
          <ul style={{ textAlign: "left", marginTop: 10 }}>
            {questions.map((q, i) => (
              <li key={i} style={{ marginBottom: 10, whiteSpace: "normal", wordWrap: "break-word" }}>
                <strong>Q{i+1}:</strong> {q.text}<br/>
                <span style={{ color: "#9EC7C9" }}>➤ <em>Your answer:</em> <span style={{color:"#000", fontWeight:"bold"}}>{answers[i] || "—"}</span></span>
              </li>
            ))}
          </ul>
        </div>
        <p style={{ fontStyle:"italic", marginTop:20, color:"#9EC7C9", borderTop:"1px solid #ccc", paddingTop:10 }}>“{quote}”</p>
        <button className="confirmBtn" onClick={onClose} style={{ marginTop: 20 }}>Close</button>
      </div>
    </div>
  );
}

function QuestionModal({ questions, onClose, onFinish }) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState([]);
  const [showHowMuch, setShowHowMuch] = useState(false);

  const handleAnswer = (answer) => {
    const updated = [...answers, answer];
    setAnswers(updated);
    if (answer === "Maybe") setShowHowMuch(true);
    else goNext(updated);
  };

  const goNext = (updated = answers) => {
    if (currentIndex + 1 < questions.length) {
      setCurrentIndex((n) => n + 1);
      setShowHowMuch(false);
    } else {
      onFinish(updated);
    }
  };

  const handleConfirmHowMuch = (value) => {
    const updated = [...answers.slice(0, currentIndex), `Maybe (${value}%)`];
    setShowHowMuch(false);
    setAnswers(updated);
    goNext(updated);
  };

  return (
    <>
      <div className="modalBackdrop">
        <div className="modal">
          <h3>Question {currentIndex+1} of {questions.length}</h3>
          <p style={{ whiteSpace: "normal", wordWrap: "break-word" }}>{questions[currentIndex].text}</p>
          <div>
            {questions[currentIndex].options.map((opt, idx) => (
              <button key={idx} className="optionButton" onClick={() => handleAnswer(opt)} disabled={showHowMuch}>{opt}</button>
            ))}
          </div>
          <button onClick={onClose} className="cancelBtn" disabled={showHowMuch} style={{ marginTop: 20 }}>Close</button>
        </div>
      </div>

      {showHowMuch && <HowMuchModal onConfirm={handleConfirmHowMuch} onCancel={() => setShowHowMuch(false)} />}
    </>
  );
}

const Activity = () => {
  const [activities, setActivities] = useState([]);
  const [formData, setFormData] = useState({
    title: "",
    color: "#00b894",
    benefits: [""],
    questions: [{ ...defaultQuestion }],
    affirmation: "",
    positiveQuote: "",
    negativeQuote: "",
  });

  const [editId, setEditId] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [deleteId, setDeleteId] = useState(null);
  const [activeActivity, setActiveActivity] = useState(null);
  const [resultData, setResultData] = useState(null);
  const [errorMsg, setErrorMsg] = useState("");
  const [successMsg, setSuccessMsg] = useState("");

  const isMounted = useRef(false);

  useEffect(() => {
    isMounted.current = true;
    try {
      const q = query(collection(db, "activities"), orderBy("createdAt", "desc"));
      const unsub = onSnapshot(q,
        (snapshot) => {
          if (!isMounted.current) return;
           const uniqueActivities = [];
const ids = new Set();

snapshot.forEach((doc) => {
  if (!ids.has(doc.id)) {
    ids.add(doc.id);
    uniqueActivities.push({ id: doc.id, ...doc.data() });
  }
});

setActivities(uniqueActivities);
console.log("onSnapshot: loaded unique activities", uniqueActivities.length);

        },
        (err) => {
          console.error("onSnapshot error:", err);
          setErrorMsg("Failed to load activities. Check console.");
        }
      );
      return () => { isMounted.current = false; unsub(); };
    } catch (err) {
      console.error("listener setup error:", err);
      setErrorMsg("Listener setup failed. See console.");
    }
  }, []);

  const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleBenefitChange = (i, val) => {
    const newB = [...formData.benefits]; newB[i] = val; setFormData({ ...formData, benefits: newB });
  };
  const handleAddBenefit = () => setFormData({ ...formData, benefits: [...formData.benefits, ""] });

  const handleQuestionChange = (i, key, val) => {
    const newQ = [...formData.questions];
    newQ[i][key] = val;
    setFormData({ ...formData, questions: newQ });
  };
  const handleAddQuestion = () => setFormData({ ...formData, questions: [...formData.questions, { ...defaultQuestion }] });

  const handleSubmit = async (e) => {
    e.preventDefault();
    // validation
    if (!formData.title.trim()) { setErrorMsg("Title is required"); setTimeout(()=>setErrorMsg(""),2500); return; }
    if (!formData.questions || formData.questions.length === 0) { setErrorMsg("Add at least one question"); setTimeout(()=>setErrorMsg(""),2500); return; }
    try {
      if (editId) {
        // update existing
        console.log("Updating doc:", editId);
        await updateDoc(doc(db, "activities", editId), {
          ...formData,
          updatedAt: serverTimestamp(),
        });
        setSuccessMsg("Activity updated");
        setTimeout(()=>setSuccessMsg(""),2000);
      } else {
        // create new
        console.log("Adding new activity to Firestore", formData);
        const ref = await addDoc(collection(db, "activities"), {
          ...formData,
          createdAt: serverTimestamp(),
        });
        console.log("Added doc id:", ref.id);
        // optimistic UI: push local copy immediately (use temp createdAt)
        setActivities((prev) => [{ id: ref.id, ...formData, createdAt: new Date().toISOString() }, ...prev]);
        setSuccessMsg("Activity saved");
        setTimeout(()=>setSuccessMsg(""),2000);
      }
      // reset
      setEditId(null);
      setFormData({
        title: "",
        color: "#00b894",
        benefits: [""],
        questions: [{ ...defaultQuestion }],
        affirmation: "",
        positiveQuote: "",
        negativeQuote: "",
      });
      window.scrollTo({ top: 0, behavior: "smooth" });
    } catch (err) {
      console.error("save error:", err);
      setErrorMsg("Save failed. See console for details.");
      setTimeout(()=>setErrorMsg(""),3500);
    }
  };

  const handleEdit = (activity) => {
    const copy = {
      title: activity.title || "",
      color: activity.color || "#00b894",
      benefits: activity.benefits && activity.benefits.length ? [...activity.benefits] : [""],
      questions: activity.questions && activity.questions.length ? activity.questions.map(q => ({ ...q })) : [{ ...defaultQuestion }],
      affirmation: activity.affirmation || "",
      positiveQuote: activity.positiveQuote || "",
      negativeQuote: activity.negativeQuote || "",
    };
    setFormData(copy);
    setEditId(activity.id);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleDelete = (id) => { setDeleteId(id); setShowModal(true); };

  const confirmDelete = async () => {
    if (!deleteId) return;
    try {
      await deleteDoc(doc(db, "activities", deleteId));
      setSuccessMsg("Deleted");
      setTimeout(()=>setSuccessMsg(""),2000);
    } catch (err) {
      console.error("delete error:", err);
      setErrorMsg("Delete failed. See console.");
      setTimeout(()=>setErrorMsg(""),3000);
    } finally {
      setDeleteId(null);
      setShowModal(false);
    }
  };

  const startActivity = (activity) => setActiveActivity(activity);

  const handleFinishActivity = (answers) => {
    // Calculate percentage based on answers
    let totalPercentage = 0;
    let answerCount = 0;

    answers.forEach(answer => {
      if (answer === "Yes") {
        totalPercentage += 100;
        answerCount++;
      } else if (answer.startsWith("Maybe")) {
        // Extract percentage from "Maybe (XX%)"
        const match = answer.match(/Maybe \((\d+)%\)/);
        if (match) {
          totalPercentage += parseInt(match[1]);
          answerCount++;
        }
      } else if (answer === "No") {
        totalPercentage += 0;
        answerCount++;
      }
    });

    const averagePercentage = answerCount > 0 ? Math.round(totalPercentage / answerCount) : 0;

    // Enhanced logic: Use negative quote for low percentages, positive for high percentages
    const useNegativeQuote = averagePercentage < 50;
    
    setActiveActivity(null);
    setResultData({
      quote: useNegativeQuote ? activeActivity.negativeQuote : activeActivity.positiveQuote,
      questions: activeActivity.questions,
      answers,
    });
  };

  return (
    <div className="activityPage">
      <section className="activityFormSection">
        <h2 style={{ color: "#9EC7C9" }}>{editId ? "Edit Activity" : "Add New Activity"}</h2>

        {errorMsg && <p className="error-msg">{errorMsg}</p>}
        {successMsg && <p className="success-msg">{successMsg}</p>}

        <form onSubmit={handleSubmit}>
          <div>
            <label>Activity Title</label>
            <input type="text" name="title" value={formData.title} onChange={handleChange} placeholder="Enter Title" required />
          </div>

          <div>
            <label>Theme Color</label>
            <div className="colorPickerWrapper">
              {pastelGreens.map((clr, idx) => (
                <div key={idx} className={`colorOption ${formData.color === clr ? "active" : ""}`} style={{ backgroundColor: clr }} onClick={() => setFormData({ ...formData, color: clr })} />
              ))}
            </div>
          </div>

          <div className="benefitsBlock">
            <label>Benefits</label>
            {formData.benefits.map((b, i) => (
              <input key={i} type="text" value={b} placeholder={`Benefit ${i+1}`} onChange={(e)=>handleBenefitChange(i, e.target.value)} required />
            ))}
            <button type="button" className="small-btn" onClick={handleAddBenefit}>Add Benefit</button>
          </div>

          <div className="questionsBlock">
            <label>Questions</label>
            {formData.questions.map((q,i) => (
              <input key={i} type="text" value={q.text} placeholder={`Question ${i+1}`} onChange={(e)=>handleQuestionChange(i, "text", e.target.value)} required />
            ))}
            <button type="button" className="small-btn" onClick={handleAddQuestion}>Add Question</button>
          </div>

          <div className="affirmationBlock">
            <label>Choose Affirmation</label>
            <select name="affirmation" value={formData.affirmation} onChange={handleChange} required>
              <option value="">Select Affirmation</option>
              <option value="Enjoy">Enjoy</option>
              <option value="Thankful">Thankful</option>
              <option value="Focus">Focus</option>
              <option value="Goals">Goals</option>
              <option value="Relief">Relief</option>
              <option value="Breathe">Breathe</option>
            </select>
          </div>

          <div>
            <label>Positive Quote</label>
            <input type="text" name="positiveQuote" value={formData.positiveQuote} onChange={handleChange} placeholder="Enter positive quote..." required />
          </div>

          <div>
            <label>Negative Quote</label>
            <input type="text" name="negativeQuote" value={formData.negativeQuote} onChange={handleChange} placeholder="Enter negative quote..." required />
          </div>

          <button type="submit" className="save-btn" style={{ color: "black" }}>{editId ? "Update Activity" : "Save Activity"}</button>
        </form>
      </section>

      <section className="activityListSection">
        <div className="sectionHeader"><h2>Saved Activities</h2></div>

        {activities.length === 0 ? (
          <p className="noDataText">No activities added yet.</p>
        ) : (
          <div className="activityGrid">
            {activities.map((act, index) => (
  <div key={`${act.id}-${index}`} className="activityCard" style={{ borderLeftColor: act.color }}>
    <h3 className="activityTitle">{act.title}</h3>
    <ul className="benefitsList">
      {(act.benefits || []).map((b, j) => <li key={j}>{b}</li>)}
    </ul>
    <div className="buttonsGroup">
      <button className="button start" style={{ backgroundColor: act.color }} onClick={() => startActivity(act)}>Start</button>
      <button className="button edit" onClick={() => handleEdit(act)}>Edit</button>
      <button className="button delete" onClick={() => handleDelete(act.id)}>Delete</button>
    </div>
  </div>
))}

          </div>
        )}
      </section>

      {showModal && (
        <div className="modalBackdrop">
          <div className="modal">
            <h3>Delete this activity?</h3>
            <p>This action cannot be undone.</p>
            <div>
              <button className="savebtn1" onClick={confirmDelete}>Yes, Delete</button>
              <button className="savebtn2" onClick={() => setShowModal(false)}>Cancel</button>
            </div>
          </div>
        </div>
      )}

      {activeActivity && (
        <QuestionModal questions={activeActivity.questions} onClose={() => setActiveActivity(null)} onFinish={handleFinishActivity} />
      )}

      {resultData && (
        <ResultModal quote={resultData.quote} questions={resultData.questions} answers={resultData.answers} onClose={() => setResultData(null)} />
      )}
    </div>
  );
};

export default Activity;