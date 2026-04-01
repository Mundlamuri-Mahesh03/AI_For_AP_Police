import { useEffect, useState } from "react";

const unitTypes = ["ZONE", "RANGE", "DISTRICT", "CIRCLE", "SDPO", "PS", "COMMISSIONERATE", "CPO", "DCPO", "ACPO"];

const initialState = {
  name: "",
  code: "",
  type: "DISTRICT",
  parentId: "",
  ministry: "",
  department: "",
  legacyRef: "",
  parentUnitCode: ""
};

export default function UnitFormModal({ mode, open, onClose, onSubmit, unit, possibleParents = [] }) {
  const [form, setForm] = useState(initialState);

  useEffect(() => {
    if (!unit) {
      setForm(initialState);
      return;
    }
    setForm({
      name: unit.name || "",
      code: unit.code || "",
      type: unit.type || "DISTRICT",
      parentId: unit.parentId ?? "",
      ministry: unit.ministry || "",
      department: unit.department || "",
      legacyRef: unit.legacyRef || "",
      parentUnitCode: unit.parentUnitCode || ""
    });
  }, [unit, open]);

  if (!open) return null;

  function handleChange(event) {
    const { name, value } = event.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  }

  function submitForm(event) {
    event.preventDefault();
    const payload = {
      ...form,
      parentId: form.parentId === "" ? null : Number(form.parentId)
    };
    onSubmit(payload);
  }

  return (
    <div className="modal-backdrop">
      <form className="card modal" onSubmit={submitForm}>
        <h3>{mode === "create" ? "Create Unit" : "Edit Unit"}</h3>
        <input required name="name" value={form.name} onChange={handleChange} placeholder="Unit name" />
        <input
          required={mode === "create"}
          disabled={mode === "edit"}
          name="code"
          value={form.code}
          onChange={handleChange}
          placeholder="Unit code"
        />
        <select name="type" value={form.type} onChange={handleChange}>
          {unitTypes.map((type) => (
            <option key={type} value={type}>
              {type}
            </option>
          ))}
        </select>
        <select name="parentId" value={form.parentId} onChange={handleChange}>
          <option value="">No parent (root)</option>
          {possibleParents.map((entry) => (
            <option key={entry.id} value={entry.id}>
              {entry.name} ({entry.code})
            </option>
          ))}
        </select>
        <input name="ministry" value={form.ministry} onChange={handleChange} placeholder="Ministry (optional)" />
        <input name="department" value={form.department} onChange={handleChange} placeholder="Department (optional)" />
        <input name="legacyRef" value={form.legacyRef} onChange={handleChange} placeholder="Legacy ref (optional)" />
        <input
          name="parentUnitCode"
          value={form.parentUnitCode}
          onChange={handleChange}
          placeholder="Parent unit code (optional)"
        />
        <div className="actions-row">
          <button type="button" onClick={onClose}>
            Cancel
          </button>
          <button type="submit">{mode === "create" ? "Create" : "Save"}</button>
        </div>
      </form>
    </div>
  );
}
