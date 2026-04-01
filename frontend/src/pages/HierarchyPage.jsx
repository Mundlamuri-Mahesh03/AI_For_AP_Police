import { useMemo, useState } from "react";
import { useGetTreeQuery, useGetScopeQuery, useCreateUnitMutation, useUpdateUnitMutation, useDeleteUnitMutation } from "../redux/slices/policeUnitSlice";
import HierarchyTree from "../components/HierarchyTree";
import UnitFormModal from "../components/UnitFormModal";
import { useAuth } from "../context/AuthContext";

function flattenTree(tree) {
  const output = [];
  const queue = [...tree];
  while (queue.length) {
    const node = queue.shift();
    output.push(node);
    queue.push(...(node.children || []));
  }
  return output;
}

export default function HierarchyPage() {
  const { user, logout } = useAuth();
  const [mode, setMode] = useState("create");
  const [selectedUnit, setSelectedUnit] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [message, setMessage] = useState("");
  const [search, setSearch] = useState("");

  // RTK Query hooks
  const { data: scopeData, isLoading: loadingScope, refetch: refetchScope } = useGetScopeQuery();
  const { data: treeData, isLoading: loadingTree } = useGetTreeQuery();
  const [createUnit] = useCreateUnitMutation();
  const [updateUnit] = useUpdateUnitMutation();
  const [deleteUnit] = useDeleteUnitMutation();

  const scopeTree = scopeData?.data?.tree || [];
  const allTree = treeData?.data || [];

  const flatUnits = useMemo(() => flattenTree(allTree), [allTree]);

  const filteredScopeTree = useMemo(() => {
    if (!search) return scopeTree;
    const term = search.toLowerCase();
    const filterNode = (node) => {
      const children = (node.children || []).map(filterNode).filter(Boolean);
      const hit =
        node.name.toLowerCase().includes(term) || node.code.toLowerCase().includes(term) || node.type.toLowerCase().includes(term);
      if (!hit && children.length === 0) return null;
      return { ...node, children };
    };
    return scopeTree.map(filterNode).filter(Boolean);
  }, [scopeTree, search]);

  function openCreate(parent) {
    setMode("create");
    setSelectedUnit(parent ? { parentId: parent.id } : null);
    setModalOpen(true);
  }

  function openEdit(unit) {
    setMode("edit");
    setSelectedUnit(unit);
    setModalOpen(true);
  }

  async function submitForm(payload) {
    try {
      if (mode === "create") {
        await createUnit({
          ...payload,
          parentId: payload.parentId ?? selectedUnit?.parentId ?? null
        }).unwrap();
      } else {
        await updateUnit({ id: selectedUnit.id, ...payload }).unwrap();
      }
      setModalOpen(false);
      setMessage("Saved successfully");
    } catch (error) {
      setMessage(error.message || "An error occurred");
    }
  }

  async function handleDeleteUnit(unit) {
    if (!window.confirm(`Delete ${unit.name}?`)) return;
    try {
      await deleteUnit(unit.id).unwrap();
      setMessage("Deleted successfully");
    } catch (error) {
      setMessage(error.message || "An error occurred");
    }
  }

  return (
    <div className="page">
      <header className="card header">
        <div>
          <h2>Police Hierarchy Management</h2>
          <p>
            Logged in as {user.name} ({user.role})
          </p>
        </div>
        <div className="actions-row">
          <button onClick={() => openCreate(null)}>Add Root Unit</button>
          <button className="secondary" onClick={logout}>Logout</button>
        </div>
      </header>
      <div className="card">
        <div className="search-box">
          <input
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Search by name, code or type"
          />
          <button className="secondary" onClick={() => setSearch('')}>
            Clear
          </button>
        </div>
        {message && <p className={`message ${message.toLowerCase().includes('error') ? 'error' : 'success'}`}>{message}</p>}
        {loadingScope || loadingTree ? (
          <p>Loading...</p>
        ) : (
          <HierarchyTree tree={filteredScopeTree} onAddChild={openCreate} onEdit={openEdit} onDelete={handleDeleteUnit} />
        )}
      </div>
      <UnitFormModal
        open={modalOpen}
        mode={mode}
        onClose={() => setModalOpen(false)}
        onSubmit={submitForm}
        unit={mode === "create" ? selectedUnit : selectedUnit}
        possibleParents={flatUnits.filter((unit) => unit.id !== selectedUnit?.id)}
      />
    </div>
  );
}
