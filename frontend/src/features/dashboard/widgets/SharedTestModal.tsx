import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { X, Flask, CheckCircle, Spinner, Plus, FloppyDisk, ArrowLeft } from 'phosphor-react';
import { supabase } from '../../../lib/supabaseClient';
import styles from '../../doctor/styles/BookAppointmentModal.module.css';

interface Test {
    id: string;
    name: string;
    base_price: number;
}

interface Props {
    patientId: string;
    role: 'DOCTOR' | 'DIAGNOSTIC';
    onClose: () => void;
    onSuccess: () => void;
    preSelectedTests?: string[];
}

export default function SharedTestModal({ patientId, role, onClose, onSuccess, preSelectedTests = [] }: Props) {
    const { t } = useTranslation();

    // Main States
    const [availableTests, setAvailableTests] = useState<Test[]>([]);
    const [selectedTests, setSelectedTests] = useState<string[]>([]);
    const [totalAmount, setTotalAmount] = useState(0);
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');

    // Add New Test States
    const [isAddingNew, setIsAddingNew] = useState(false);
    const [newTestName, setNewTestName] = useState('');
    const [newTestPrice, setNewTestPrice] = useState('');
    const [addingLoader, setAddingLoader] = useState(false);

    // 1. Fetch Tests
    const fetchTests = async () => {
        setLoading(true);
        const { data } = await supabase.from('available_tests').select('*').order('name');
        if (data) {
            const tests = data as Test[];
            setAvailableTests(tests);

            // Handle Pre-selection
            if (preSelectedTests.length > 0) {
                const matchedTests = tests.filter(t => preSelectedTests.includes(t.name));
                // Only set if not already set to avoid override on re-fetch
                if (selectedTests.length === 0) {
                    const matchedNames = matchedTests.map(t => t.name);
                    setSelectedTests(matchedNames);
                    const price = matchedTests.reduce((sum, t) => sum + t.base_price, 0);
                    setTotalAmount(price);
                }
            }
        }
        setLoading(false);
    };

    useEffect(() => {
        fetchTests();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    // 2. Toggle Selection Logic
    const toggleTest = (test: Test) => {
        if (selectedTests.includes(test.name)) {
            setSelectedTests(prev => prev.filter(t => t !== test.name));
            setTotalAmount(prev => prev - test.base_price);
        } else {
            setSelectedTests(prev => [...prev, test.name]);
            setTotalAmount(prev => prev + test.base_price);
        }
    };

    // 3. Add New Test Logic
    const handleAddNewTest = async () => {
        if (!newTestName.trim()) return alert("Please enter test name");
        if (!newTestPrice || isNaN(Number(newTestPrice))) return alert("Please enter valid price");

        setAddingLoader(true);

        // Check for duplicate
        const exists = availableTests.some(t => t.name.toLowerCase() === newTestName.trim().toLowerCase());
        if (exists) {
            alert("Test already exists!");
            setAddingLoader(false);
            return;
        }

        const { data, error } = await supabase.from('available_tests').insert({
            name: newTestName.trim(),
            base_price: Number(newTestPrice),
            category: 'General' // Default category
        }).select().single();

        if (error) {
            console.error(error);
            alert("Failed to add test.");
        } else if (data) {
            // Success: Update list and select the new test
            const newTest = data as Test;
            setAvailableTests(prev => [...prev, newTest].sort((a, b) => a.name.localeCompare(b.name)));

            // Auto select the new test
            setSelectedTests(prev => [...prev, newTest.name]);
            setTotalAmount(prev => prev + newTest.base_price);

            // Reset Form
            setIsAddingNew(false);
            setNewTestName('');
            setNewTestPrice('');
            alert("New test added successfully!");
        }
        setAddingLoader(false);
    };

    // 4. Handle Submit
    const handleSubmit = async () => {
        if (selectedTests.length === 0) return alert("Select at least one test.");

        setSubmitting(true);
        const { data: { user } } = await supabase.auth.getUser();

        if (!user) {
            setSubmitting(false);
            return;
        }

        const promises = selectedTests.map(async (testName) => {
            const testInfo = availableTests.find(t => t.name === testName);
            const individualPrice = testInfo ? testInfo.base_price : 0;

            if (role === 'DOCTOR') {
                return supabase.from('medical_events').insert({
                    patient_id: patientId,
                    uploader_id: user.id,
                    title: `Test Order: ${testName}`,
                    event_type: 'TEST_ORDER',
                    event_date: new Date().toISOString(),
                    severity: 'MEDIUM',
                    summary: `Doctor advised test: ${testName}`,
                    key_findings: [testName],
                });
            } else {
                return supabase.from('patient_payments').insert({
                    patient_id: patientId,
                    provider_id: user.id,
                    test_names: [testName],
                    total_amount: individualPrice,
                    paid_amount: 0,
                    status: 'DUE',
                    report_status: 'PENDING'
                });
            }
        });

        await Promise.all(promises);
        setSubmitting(false);

        alert(role === 'DOCTOR' ? "Tests assigned!" : "Invoices created!");
        onSuccess();
        onClose();
    };

    // Filter tests
    const filteredTests = availableTests.filter(t =>
        t.name.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className={styles.overlay}>
            <div className={styles.modal}>
                <button onClick={onClose} className={styles.closeBtn}><X size={24} /></button>

                <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 20 }}>
                    <Flask size={28} color={role === 'DOCTOR' ? "#4338ca" : "#059669"} weight="duotone"/>
                    <h2 style={{ margin: 0 }}>
                        {role === 'DOCTOR' ? "Assign Tests" : "Create Bill"}
                    </h2>
                </div>

                {/* View Switcher: List vs Add New */}
                {isAddingNew ? (
                    // --- ADD NEW TEST VIEW ---
                    <div style={{ padding: '20px', background: '#f8fafc', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
                        <div style={{display:'flex', alignItems:'center', gap:10, marginBottom:15}}>
                            <button onClick={() => setIsAddingNew(false)} style={{background:'none', border:'none', cursor:'pointer', padding:0}}>
                                <ArrowLeft size={20} color="#666"/>
                            </button>
                            <h3 style={{margin:0, fontSize:'1.1rem'}}>Add New Test</h3>
                        </div>

                        <div style={{marginBottom: '15px'}}>
                            <label style={{display:'block', marginBottom:'5px', fontWeight:500}}>Test Name</label>
                            <input
                                className={styles.input}
                                value={newTestName}
                                onChange={(e) => setNewTestName(e.target.value)}
                                placeholder="e.g. CBC, Lipid Profile"
                            />
                        </div>

                        <div style={{marginBottom: '20px'}}>
                            <label style={{display:'block', marginBottom:'5px', fontWeight:500}}>Price (৳)</label>
                            <input
                                className={styles.input}
                                type="number"
                                value={newTestPrice}
                                onChange={(e) => setNewTestPrice(e.target.value)}
                                placeholder="e.g. 500"
                            />
                        </div>

                        <button
                            onClick={handleAddNewTest}
                            disabled={addingLoader}
                            className={styles.submitBtn}
                            style={{width:'100%', backgroundColor: '#059669'}}
                        >
                            {addingLoader ? <Spinner className={styles.spin} size={20} /> : <><FloppyDisk size={20} /> Save & Select</>}
                        </button>
                    </div>
                ) : (
                    // --- LIST VIEW ---
                    <>
                        {/* Search & Add Bar */}
                        <div style={{display:'flex', gap:10, marginBottom:10}}>
                            <input
                                style={{flex:1, padding:'10px', borderRadius:'8px', border:'1px solid #ccc'}}
                                placeholder="Search tests..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
                            <button
                                onClick={() => setIsAddingNew(true)}
                                style={{
                                    display:'flex', alignItems:'center', gap:5,
                                    padding:'0 15px', borderRadius:'8px', border:'none',
                                    background:'#EEF2FF', color:'#4338ca', cursor:'pointer', fontWeight:600
                                }}
                            >
                                <Plus size={18} /> Add New
                            </button>
                        </div>

                        {/* Test List */}
                        {loading ? (
                            <div style={{textAlign: 'center', padding: 20}}>Loading...</div>
                        ) : (
                            <div style={{ maxHeight: '40vh', overflowY: 'auto', border: '1px solid #e2e8f0', borderRadius: '8px', padding: '10px', background: '#f8fafc' }}>
                                {filteredTests.length === 0 ? (
                                    <p style={{textAlign:'center', color:'#888'}}>No tests found. Add a new one!</p>
                                ) : (
                                    filteredTests.map(test => (
                                        <label key={test.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px', borderBottom: '1px solid #eee', cursor: 'pointer', backgroundColor: selectedTests.includes(test.name) ? '#fff' : 'transparent', borderRadius: '6px' }}>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                                                <input type="checkbox" checked={selectedTests.includes(test.name)} onChange={() => toggleTest(test)} style={{ width: 16, height: 16, cursor: 'pointer' }} />
                                                <span style={{ fontWeight: 500 }}>{test.name}</span>
                                            </div>
                                            <span style={{ color: '#64748b', fontSize: '0.9rem' }}>৳{test.base_price}</span>
                                        </label>
                                    ))
                                )}
                            </div>
                        )}

                        {/* Footer Info */}
                        <div style={{ marginTop: '20px', padding: '15px', background: role === 'DOCTOR' ? '#EEF2FF' : '#ECFDF5', borderRadius: '8px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <div>
                                <div style={{ fontSize: '0.9rem', color: '#555' }}>Selected: <strong>{selectedTests.length}</strong></div>
                                <div style={{ fontSize: '1.1rem', fontWeight: 'bold', color: role === 'DOCTOR' ? '#4338ca' : '#059669' }}>Total: ৳{totalAmount}</div>
                            </div>

                            <button
                                onClick={handleSubmit}
                                className={styles.submitBtn}
                                disabled={submitting}
                                style={{ width: 'auto', padding: '10px 30px', margin: 0, backgroundColor: role === 'DOCTOR' ? 'var(--primary)' : '#059669' }}
                            >
                                {submitting ? <><Spinner className={styles.spin} size={20} /> Processing...</> : <><CheckCircle size={20} /> {role === 'DOCTOR' ? 'Assign' : 'Create Bill'}</>}
                            </button>
                        </div>
                    </>
                )}
            </div>
        </div>
    );
}