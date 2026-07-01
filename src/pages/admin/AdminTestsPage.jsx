import { useState, useEffect } from "react";
import AdminLayout from "../../components/admin/AdminLayout";
import {
  Plus,
  Edit2,
  Trash2,
  X,
  Save,
  FolderOpen,
  Folder,
  ChevronDown,
  ChevronRight,
  Link as LinkIcon,
  CheckSquare,
  Square,
  FolderPlus,
  MoveRight,
} from "lucide-react";
import { testGroupsService, testsService } from "../../services/firebaseService";

const UNGROUPED = "__ungrouped__";

export default function AdminTestsPage() {
  const [groups, setGroups] = useState([]);
  const [tests, setTests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(null);

  // Expanded folders
  const [expandedGroups, setExpandedGroups] = useState(new Set());

  // Group form
  const [showGroupForm, setShowGroupForm] = useState(false);
  const [editingGroup, setEditingGroup] = useState(null);
  const [groupFormData, setGroupFormData] = useState({ name: "", description: "" });
  const [groupErrors, setGroupErrors] = useState({});

  // Test form
  const [showTestForm, setShowTestForm] = useState(false);
  const [editingTest, setEditingTest] = useState(null);
  const [testFormData, setTestFormData] = useState({ title: "", link: "", testGroupId: "" });
  const [testErrors, setTestErrors] = useState({});

  // Bulk assign
  const [selectedTests, setSelectedTests] = useState(new Set());
  const [showBulkAssign, setShowBulkAssign] = useState(false);
  const [bulkTargetGroupId, setBulkTargetGroupId] = useState("");

  // Success messages
  const [successMsg, setSuccessMsg] = useState("");

  useEffect(() => {
    loadAll();
  }, []);

  const loadAll = async () => {
    setLoading(true);
    try {
      const [groupsData, testsData] = await Promise.all([
        testGroupsService.getTestGroups(),
        testsService.getTests(),
      ]);
      setGroups(groupsData);
      setTests(testsData);
      // Auto-expand all groups on load
      const allIds = new Set(groupsData.map((g) => g.id));
      allIds.add(UNGROUPED);
      setExpandedGroups(allIds);
    } catch (error) {
      console.error("Error loading data:", error);
    } finally {
      setLoading(false);
    }
  };

  const showSuccess = (msg) => {
    setSuccessMsg(msg);
    setTimeout(() => setSuccessMsg(""), 3000);
  };

  // ─── Group form ───────────────────────────────────────────────────────────
  const openGroupForm = (group = null) => {
    setEditingGroup(group);
    setGroupFormData(
      group ? { name: group.name, description: group.description || "" } : { name: "", description: "" }
    );
    setGroupErrors({});
    setShowGroupForm(true);
  };

  const closeGroupForm = () => {
    setShowGroupForm(false);
    setEditingGroup(null);
    setGroupFormData({ name: "", description: "" });
    setGroupErrors({});
  };

  const handleGroupSubmit = async (e) => {
    e.preventDefault();
    if (!groupFormData.name.trim()) {
      setGroupErrors({ name: "Group name is required" });
      return;
    }
    setSaving(true);
    try {
      if (editingGroup) {
        const updated = await testGroupsService.updateTestGroup(editingGroup.id, groupFormData);
        setGroups((prev) => prev.map((g) => (g.id === editingGroup.id ? { ...g, ...updated } : g)));
        // Update group name on all tests in this group
        setTests((prev) =>
          prev.map((t) =>
            t.testGroupId === editingGroup.id ? { ...t, testGroupName: groupFormData.name } : t
          )
        );
        showSuccess(`Folder "${groupFormData.name}" updated.`);
      } else {
        const newGroup = await testGroupsService.addTestGroup(groupFormData);
        setGroups((prev) => [...prev, newGroup]);
        setExpandedGroups((prev) => new Set([...prev, newGroup.id]));
        showSuccess(`Folder "${groupFormData.name}" created.`);
      }
      closeGroupForm();
    } catch (error) {
      setGroupErrors({ submit: error.message || "Failed to save. Please try again." });
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteGroup = async (group) => {
    const testsInGroup = tests.filter((t) => t.testGroupId === group.id);
    const warning =
      testsInGroup.length > 0
        ? `\n\n${testsInGroup.length} test(s) inside will be moved to "Ungrouped".`
        : "";
    if (!confirm(`Delete folder "${group.name}"?${warning}`)) return;

    setDeleting(group.id);
    try {
      await testGroupsService.deleteTestGroup(group.id);
      setGroups((prev) => prev.filter((g) => g.id !== group.id));
      // Move tests to ungrouped
      if (testsInGroup.length > 0) {
        await testsService.bulkAssignGroup(testsInGroup.map((t) => t.id), "", "");
        setTests((prev) =>
          prev.map((t) => (t.testGroupId === group.id ? { ...t, testGroupId: "", testGroupName: "" } : t))
        );
      }
      showSuccess(`Folder "${group.name}" deleted.`);
    } catch (error) {
      console.error("Error deleting group:", error);
    } finally {
      setDeleting(null);
    }
  };

  // ─── Test form ────────────────────────────────────────────────────────────
  const openTestForm = (test = null, defaultGroupId = "") => {
    setEditingTest(test);
    setTestFormData(
      test
        ? { title: test.title, link: test.link || "", testGroupId: test.testGroupId || "" }
        : { title: "", link: "", testGroupId: defaultGroupId }
    );
    setTestErrors({});
    setShowTestForm(true);
  };

  const closeTestForm = () => {
    setShowTestForm(false);
    setEditingTest(null);
    setTestFormData({ title: "", link: "", testGroupId: "" });
    setTestErrors({});
  };

  const getGroupNameById = (id) => groups.find((g) => g.id === id)?.name || "";

  const handleTestSubmit = async (e) => {
    e.preventDefault();
    if (!testFormData.title.trim()) {
      setTestErrors({ title: "Test title is required" });
      return;
    }
    setSaving(true);
    try {
      const payload = {
        ...testFormData,
        testGroupName: getGroupNameById(testFormData.testGroupId),
      };
      if (editingTest) {
        const updated = await testsService.updateTest(editingTest.id, payload);
        setTests((prev) => prev.map((t) => (t.id === editingTest.id ? { ...t, ...updated } : t)));
        showSuccess(`Test "${testFormData.title}" updated.`);
      } else {
        const newTest = await testsService.addTest(payload);
        setTests((prev) => [...prev, newTest]);
        showSuccess(`Test "${testFormData.title}" added.`);
      }
      closeTestForm();
    } catch (error) {
      setTestErrors({ submit: error.message || "Failed to save. Please try again." });
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteTest = async (test) => {
    if (!confirm(`Delete test "${test.title}"?`)) return;
    setDeleting(test.id);
    try {
      await testsService.deleteTest(test.id);
      setTests((prev) => prev.filter((t) => t.id !== test.id));
      setSelectedTests((prev) => { const s = new Set(prev); s.delete(test.id); return s; });
      showSuccess(`Test "${test.title}" deleted.`);
    } catch (error) {
      console.error("Error deleting test:", error);
    } finally {
      setDeleting(null);
    }
  };

  // ─── Bulk assign ──────────────────────────────────────────────────────────
  const toggleSelectTest = (id) => {
    setSelectedTests((prev) => {
      const s = new Set(prev);
      s.has(id) ? s.delete(id) : s.add(id);
      return s;
    });
  };

  const handleBulkAssign = async () => {
    if (selectedTests.size === 0) return;
    setSaving(true);
    try {
      const groupName = getGroupNameById(bulkTargetGroupId);
      await testsService.bulkAssignGroup([...selectedTests], bulkTargetGroupId, groupName);
      setTests((prev) =>
        prev.map((t) =>
          selectedTests.has(t.id)
            ? { ...t, testGroupId: bulkTargetGroupId, testGroupName: groupName }
            : t
        )
      );
      setSelectedTests(new Set());
      setShowBulkAssign(false);
      setBulkTargetGroupId("");
      showSuccess(`${selectedTests.size} test(s) moved to "${groupName || "Ungrouped"}".`);
    } catch (error) {
      console.error("Error bulk assigning:", error);
    } finally {
      setSaving(false);
    }
  };

  // ─── Helpers ──────────────────────────────────────────────────────────────
  const toggleExpand = (id) => {
    setExpandedGroups((prev) => {
      const s = new Set(prev);
      s.has(id) ? s.delete(id) : s.add(id);
      return s;
    });
  };

  const testsInGroup = (groupId) =>
    tests.filter((t) => (groupId === UNGROUPED ? !t.testGroupId : t.testGroupId === groupId));

  const ungroupedTests = tests.filter((t) => !t.testGroupId);

  // ─── Render ───────────────────────────────────────────────────────────────
  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Test Management</h1>
            <p className="text-gray-500 mt-1">
              Organise tests into folders (Batch 1, Batch 2, etc.)
            </p>
          </div>
          <div className="flex gap-3 flex-wrap">
            <button
              onClick={() => openGroupForm()}
              className="flex items-center gap-2 bg-brand-purple text-white px-4 py-2 rounded-lg hover:opacity-90 transition"
            >
              <FolderPlus className="h-5 w-5" />
              New Folder
            </button>
            <button
              onClick={() => openTestForm()}
              className="flex items-center gap-2 bg-brand-navy text-white px-4 py-2 rounded-lg hover:bg-brand-maroon transition"
            >
              <Plus className="h-5 w-5" />
              Add Test
            </button>
          </div>
        </div>

        {/* Success banner */}
        {successMsg && (
          <div className="bg-green-50 border border-green-200 text-green-800 px-4 py-3 rounded-lg font-medium">
            {successMsg}
          </div>
        )}

        {/* Bulk assign bar */}
        {selectedTests.size > 0 && (
          <div className="bg-brand-navy text-white px-5 py-3 rounded-xl flex flex-wrap items-center gap-4">
            <span className="font-semibold">{selectedTests.size} test(s) selected</span>
            {showBulkAssign ? (
              <>
                <select
                  value={bulkTargetGroupId}
                  onChange={(e) => setBulkTargetGroupId(e.target.value)}
                  className="text-gray-900 px-3 py-1.5 rounded-lg text-sm"
                >
                  <option value="">— Ungrouped —</option>
                  {groups.map((g) => (
                    <option key={g.id} value={g.id}>{g.name}</option>
                  ))}
                </select>
                <button
                  onClick={handleBulkAssign}
                  disabled={saving}
                  className="flex items-center gap-1 bg-white text-brand-navy px-3 py-1.5 rounded-lg text-sm font-semibold hover:bg-gray-100 transition disabled:opacity-50"
                >
                  <MoveRight className="h-4 w-4" />
                  {saving ? "Moving..." : "Move"}
                </button>
                <button
                  onClick={() => setShowBulkAssign(false)}
                  className="text-white/70 hover:text-white text-sm"
                >
                  Cancel
                </button>
              </>
            ) : (
              <>
                <button
                  onClick={() => setShowBulkAssign(true)}
                  className="flex items-center gap-1 bg-white text-brand-navy px-3 py-1.5 rounded-lg text-sm font-semibold hover:bg-gray-100 transition"
                >
                  <MoveRight className="h-4 w-4" />
                  Move to Folder
                </button>
                <button
                  onClick={() => setSelectedTests(new Set())}
                  className="text-white/70 hover:text-white text-sm"
                >
                  Clear
                </button>
              </>
            )}
          </div>
        )}

        {/* Group form */}
        {showGroupForm && (
          <div className="bg-white rounded-xl shadow-lg p-6 space-y-4 border-l-4 border-brand-purple">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-bold text-gray-900">
                {editingGroup ? "Edit Folder" : "New Folder"}
              </h2>
              <button onClick={closeGroupForm} className="p-2 hover:bg-gray-100 rounded-lg">
                <X className="h-5 w-5" />
              </button>
            </div>
            <form onSubmit={handleGroupSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">
                  Folder Name *
                </label>
                <input
                  type="text"
                  value={groupFormData.name}
                  onChange={(e) => setGroupFormData({ ...groupFormData, name: e.target.value })}
                  className="w-full px-3 py-2 border-2 border-gray-300 rounded-lg focus:outline-none focus:border-brand-purple"
                  placeholder="e.g., Batch 1 — Statistics Mock Tests"
                  autoFocus
                />
                {groupErrors.name && <p className="text-red-500 text-sm mt-1">{groupErrors.name}</p>}
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">
                  Description (optional)
                </label>
                <input
                  type="text"
                  value={groupFormData.description}
                  onChange={(e) => setGroupFormData({ ...groupFormData, description: e.target.value })}
                  className="w-full px-3 py-2 border-2 border-gray-300 rounded-lg focus:outline-none focus:border-brand-purple"
                  placeholder="e.g., Group I full-length mock tests — Oct 2025 batch"
                />
              </div>
              {groupErrors.submit && (
                <p className="text-red-500 text-sm">{groupErrors.submit}</p>
              )}
              <div className="flex gap-3">
                <button
                  type="submit"
                  disabled={saving}
                  className="flex items-center gap-2 bg-brand-purple text-white px-4 py-2 rounded-lg hover:opacity-90 transition disabled:opacity-50"
                >
                  <Save className="h-4 w-4" />
                  {saving ? "Saving..." : editingGroup ? "Update" : "Create Folder"}
                </button>
                <button
                  type="button"
                  onClick={closeGroupForm}
                  className="px-4 py-2 border-2 border-gray-300 rounded-lg hover:bg-gray-50 transition"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Test form */}
        {showTestForm && (
          <div className="bg-white rounded-xl shadow-lg p-6 space-y-4 border-l-4 border-brand-navy">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-bold text-gray-900">
                {editingTest ? "Edit Test" : "Add New Test"}
              </h2>
              <button onClick={closeTestForm} className="p-2 hover:bg-gray-100 rounded-lg">
                <X className="h-5 w-5" />
              </button>
            </div>
            <form onSubmit={handleTestSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1">
                    Test Title *
                  </label>
                  <input
                    type="text"
                    value={testFormData.title}
                    onChange={(e) => setTestFormData({ ...testFormData, title: e.target.value })}
                    className="w-full px-3 py-2 border-2 border-gray-300 rounded-lg focus:outline-none focus:border-brand-navy"
                    placeholder="e.g., Full Mock Test 1"
                    autoFocus
                  />
                  {testErrors.title && <p className="text-red-500 text-sm mt-1">{testErrors.title}</p>}
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1">
                    Folder
                  </label>
                  <select
                    value={testFormData.testGroupId}
                    onChange={(e) => setTestFormData({ ...testFormData, testGroupId: e.target.value })}
                    className="w-full px-3 py-2 border-2 border-gray-300 rounded-lg focus:outline-none focus:border-brand-navy bg-white"
                  >
                    <option value="">— Ungrouped —</option>
                    {groups.map((g) => (
                      <option key={g.id} value={g.id}>{g.name}</option>
                    ))}
                  </select>
                </div>
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">
                  Test Link (optional)
                </label>
                <input
                  type="url"
                  value={testFormData.link}
                  onChange={(e) => setTestFormData({ ...testFormData, link: e.target.value })}
                  className="w-full px-3 py-2 border-2 border-gray-300 rounded-lg focus:outline-none focus:border-brand-navy"
                  placeholder="https://..."
                />
              </div>
              {testErrors.submit && <p className="text-red-500 text-sm">{testErrors.submit}</p>}
              <div className="flex gap-3">
                <button
                  type="submit"
                  disabled={saving}
                  className="flex items-center gap-2 bg-brand-navy text-white px-4 py-2 rounded-lg hover:bg-brand-maroon transition disabled:opacity-50"
                >
                  <Save className="h-4 w-4" />
                  {saving ? "Saving..." : editingTest ? "Update" : "Add Test"}
                </button>
                <button
                  type="button"
                  onClick={closeTestForm}
                  className="px-4 py-2 border-2 border-gray-300 rounded-lg hover:bg-gray-50 transition"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Main content */}
        {loading ? (
          <div className="bg-white rounded-xl shadow-md p-12 text-center">
            <p className="text-gray-500">Loading tests...</p>
          </div>
        ) : (
          <div className="space-y-3">
            {groups.length === 0 && tests.length === 0 ? (
              <div className="bg-white rounded-xl shadow-md p-12 text-center space-y-3">
                <FolderOpen className="h-12 w-12 text-gray-300 mx-auto" />
                <p className="text-gray-500 font-medium">No tests yet.</p>
                <p className="text-gray-400 text-sm">
                  Create a folder first, then add tests inside it.
                </p>
                <button
                  onClick={() => openGroupForm()}
                  className="mt-2 text-brand-purple font-semibold hover:underline"
                >
                  + Create your first folder
                </button>
              </div>
            ) : (
              <>
                {/* Render each group as a folder */}
                {groups.map((group) => {
                  const groupTests = testsInGroup(group.id);
                  const isExpanded = expandedGroups.has(group.id);
                  return (
                    <div key={group.id} className="bg-white rounded-xl shadow-md overflow-hidden">
                      {/* Folder header */}
                      <div
                        className="flex items-center gap-3 px-5 py-4 cursor-pointer hover:bg-gray-50 transition select-none"
                        onClick={() => toggleExpand(group.id)}
                      >
                        <span className="text-brand-purple">
                          {isExpanded ? (
                            <FolderOpen className="h-6 w-6" />
                          ) : (
                            <Folder className="h-6 w-6" />
                          )}
                        </span>
                        <div className="flex-1 min-w-0">
                          <p className="font-bold text-gray-900 text-base leading-tight">
                            {group.name}
                          </p>
                          {group.description && (
                            <p className="text-gray-400 text-xs mt-0.5 truncate">{group.description}</p>
                          )}
                        </div>
                        <span className="text-xs bg-brand-purple/10 text-brand-purple font-semibold px-2.5 py-1 rounded-full">
                          {groupTests.length} test{groupTests.length !== 1 ? "s" : ""}
                        </span>
                        <div className="flex gap-2 ml-2" onClick={(e) => e.stopPropagation()}>
                          <button
                            onClick={() => openTestForm(null, group.id)}
                            title="Add test to this folder"
                            className="p-1.5 text-brand-navy hover:bg-brand-navy/10 rounded-lg transition"
                          >
                            <Plus className="h-4 w-4" />
                          </button>
                          <button
                            onClick={() => openGroupForm(group)}
                            title="Edit folder"
                            className="p-1.5 text-blue-600 hover:bg-blue-50 rounded-lg transition"
                          >
                            <Edit2 className="h-4 w-4" />
                          </button>
                          <button
                            onClick={() => handleDeleteGroup(group)}
                            disabled={deleting === group.id}
                            title="Delete folder"
                            className="p-1.5 text-red-500 hover:bg-red-50 rounded-lg transition disabled:opacity-50"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                        <span className="text-gray-400 ml-1">
                          {isExpanded ? (
                            <ChevronDown className="h-5 w-5" />
                          ) : (
                            <ChevronRight className="h-5 w-5" />
                          )}
                        </span>
                      </div>

                      {/* Tests inside */}
                      {isExpanded && (
                        <div className="border-t border-gray-100">
                          {groupTests.length === 0 ? (
                            <div className="px-6 py-4 text-sm text-gray-400 flex items-center gap-2">
                              <span>No tests in this folder yet.</span>
                              <button
                                onClick={() => openTestForm(null, group.id)}
                                className="text-brand-navy font-semibold hover:underline"
                              >
                                + Add test
                              </button>
                            </div>
                          ) : (
                            <table className="w-full">
                              <tbody>
                                {groupTests.map((test, idx) => (
                                  <tr
                                    key={test.id}
                                    className={`border-b last:border-0 hover:bg-gray-50 transition ${
                                      selectedTests.has(test.id) ? "bg-brand-navy/5" : ""
                                    }`}
                                  >
                                    <td className="pl-6 pr-2 py-3 w-10">
                                      <button
                                        onClick={() => toggleSelectTest(test.id)}
                                        className="text-gray-400 hover:text-brand-navy transition"
                                        title="Select"
                                      >
                                        {selectedTests.has(test.id) ? (
                                          <CheckSquare className="h-4 w-4 text-brand-navy" />
                                        ) : (
                                          <Square className="h-4 w-4" />
                                        )}
                                      </button>
                                    </td>
                                    <td className="px-3 py-3 text-xs font-semibold text-gray-400 w-10">
                                      {idx + 1}
                                    </td>
                                    <td className="px-3 py-3 text-sm font-semibold text-gray-900 flex-1">
                                      {test.title}
                                    </td>
                                    <td className="px-3 py-3 text-sm">
                                      {test.link ? (
                                        <a
                                          href={test.link}
                                          target="_blank"
                                          rel="noopener noreferrer"
                                          className="flex items-center gap-1 text-brand-blue hover:underline text-xs"
                                          onClick={(e) => e.stopPropagation()}
                                        >
                                          <LinkIcon className="h-3.5 w-3.5" />
                                          Open link
                                        </a>
                                      ) : (
                                        <span className="text-gray-300 text-xs">No link</span>
                                      )}
                                    </td>
                                    <td className="px-3 py-3 text-right pr-5">
                                      <div className="flex justify-end gap-2">
                                        <button
                                          onClick={() => openTestForm(test)}
                                          className="p-1.5 text-blue-600 hover:bg-blue-50 rounded-lg transition"
                                          title="Edit test"
                                        >
                                          <Edit2 className="h-4 w-4" />
                                        </button>
                                        <button
                                          onClick={() => handleDeleteTest(test)}
                                          disabled={deleting === test.id}
                                          className="p-1.5 text-red-500 hover:bg-red-50 rounded-lg transition disabled:opacity-50"
                                          title="Delete test"
                                        >
                                          <Trash2 className="h-4 w-4" />
                                        </button>
                                      </div>
                                    </td>
                                  </tr>
                                ))}
                              </tbody>
                            </table>
                          )}
                        </div>
                      )}
                    </div>
                  );
                })}

                {/* Ungrouped tests */}
                {ungroupedTests.length > 0 && (
                  <div className="bg-white rounded-xl shadow-md overflow-hidden border-2 border-dashed border-gray-200">
                    <div
                      className="flex items-center gap-3 px-5 py-4 cursor-pointer hover:bg-gray-50 transition select-none"
                      onClick={() => toggleExpand(UNGROUPED)}
                    >
                      <span className="text-gray-400">
                        {expandedGroups.has(UNGROUPED) ? (
                          <FolderOpen className="h-6 w-6" />
                        ) : (
                          <Folder className="h-6 w-6" />
                        )}
                      </span>
                      <div className="flex-1">
                        <p className="font-bold text-gray-500 text-base">Ungrouped</p>
                        <p className="text-gray-400 text-xs">Not assigned to any folder yet</p>
                      </div>
                      <span className="text-xs bg-gray-100 text-gray-500 font-semibold px-2.5 py-1 rounded-full">
                        {ungroupedTests.length} test{ungroupedTests.length !== 1 ? "s" : ""}
                      </span>
                      <span className="text-gray-400 ml-1">
                        {expandedGroups.has(UNGROUPED) ? (
                          <ChevronDown className="h-5 w-5" />
                        ) : (
                          <ChevronRight className="h-5 w-5" />
                        )}
                      </span>
                    </div>
                    {expandedGroups.has(UNGROUPED) && (
                      <div className="border-t border-gray-100">
                        <table className="w-full">
                          <tbody>
                            {ungroupedTests.map((test, idx) => (
                              <tr
                                key={test.id}
                                className={`border-b last:border-0 hover:bg-gray-50 transition ${
                                  selectedTests.has(test.id) ? "bg-brand-navy/5" : ""
                                }`}
                              >
                                <td className="pl-6 pr-2 py-3 w-10">
                                  <button
                                    onClick={() => toggleSelectTest(test.id)}
                                    className="text-gray-400 hover:text-brand-navy transition"
                                    title="Select"
                                  >
                                    {selectedTests.has(test.id) ? (
                                      <CheckSquare className="h-4 w-4 text-brand-navy" />
                                    ) : (
                                      <Square className="h-4 w-4" />
                                    )}
                                  </button>
                                </td>
                                <td className="px-3 py-3 text-xs font-semibold text-gray-400 w-10">
                                  {idx + 1}
                                </td>
                                <td className="px-3 py-3 text-sm font-semibold text-gray-900">
                                  {test.title}
                                </td>
                                <td className="px-3 py-3 text-sm">
                                  {test.link ? (
                                    <a
                                      href={test.link}
                                      target="_blank"
                                      rel="noopener noreferrer"
                                      className="flex items-center gap-1 text-brand-blue hover:underline text-xs"
                                    >
                                      <LinkIcon className="h-3.5 w-3.5" />
                                      Open link
                                    </a>
                                  ) : (
                                    <span className="text-gray-300 text-xs">No link</span>
                                  )}
                                </td>
                                <td className="px-3 py-3 text-right pr-5">
                                  <div className="flex justify-end gap-2">
                                    <button
                                      onClick={() => openTestForm(test)}
                                      className="p-1.5 text-blue-600 hover:bg-blue-50 rounded-lg transition"
                                      title="Edit test"
                                    >
                                      <Edit2 className="h-4 w-4" />
                                    </button>
                                    <button
                                      onClick={() => handleDeleteTest(test)}
                                      disabled={deleting === test.id}
                                      className="p-1.5 text-red-500 hover:bg-red-50 rounded-lg transition disabled:opacity-50"
                                      title="Delete test"
                                    >
                                      <Trash2 className="h-4 w-4" />
                                    </button>
                                  </div>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    )}
                  </div>
                )}
              </>
            )}
          </div>
        )}
      </div>
    </AdminLayout>
  );
}
