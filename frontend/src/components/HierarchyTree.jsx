import { useState } from "react";
import { FaChevronDown, FaChevronRight, FaPlus, FaEdit, FaTrash } from "react-icons/fa";

function Node({ unit, onAddChild, onEdit, onDelete }) {
  const [open, setOpen] = useState(true);
  const hasChildren = unit.children?.length > 0;

  return (
    <div className="tree-node">
      <div className="node-header">
        <button className="icon-btn" onClick={() => setOpen((prev) => !prev)} disabled={!hasChildren}>
          {hasChildren ? (open ? <FaChevronDown /> : <FaChevronRight />) : <span className="dot" />}
        </button>
        <span className="node-label">
          {unit.name} <small>({unit.type})</small> <code>{unit.code}</code>
        </span>
        <div className="node-actions">
          <button className="icon-btn" onClick={() => onAddChild(unit)}>
            <FaPlus />
          </button>
          <button className="icon-btn" onClick={() => onEdit(unit)}>
            <FaEdit />
          </button>
          <button className="icon-btn" onClick={() => onDelete(unit)}>
            <FaTrash />
          </button>
        </div>
      </div>
      {open && hasChildren && (
        <div className="node-children">
          {unit.children.map((child) => (
            <Node key={child.id} unit={child} onAddChild={onAddChild} onEdit={onEdit} onDelete={onDelete} />
          ))}
        </div>
      )}
    </div>
  );
}

export default function HierarchyTree({ tree, onAddChild, onEdit, onDelete }) {
  return (
    <div>
      {tree.map((root) => (
        <Node key={root.id} unit={root} onAddChild={onAddChild} onEdit={onEdit} onDelete={onDelete} />
      ))}
    </div>
  );
}
