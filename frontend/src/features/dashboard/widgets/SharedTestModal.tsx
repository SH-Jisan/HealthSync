import { useState, useEffect } from 'react';
import { X, Flask, CheckCircle, Spinner, Plus, FloppyDisk, ArrowLeft } from 'phosphor-react';
import { supabase } from '@/shared/lib/supabaseClient';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import styles from './styles/SharedTestModal.module.css';

interface Test {
    id: string;
    name: string;
    base_price: number;
    category?: string;
}

interface Props {
    patientId: string;
    role: 'DOCTOR' | 'DIAGNOSTIC';
    onClose: () => void;
    onSuccess: () => void;
    preSelectedTests?: string[];
}

export default function SharedTestModal({ patientId, role, onClose, onSuccess, preSelectedTests = [] }: Props) {
    const queryClient = useQueryClient();

    // UI States
    const [selectedTests, setSelectedTests] = useState<string[]>([]);
    const [totalAmount, setTotalAmount] = useState(0);
    const [searchTerm, setSearchTerm] = useState('');

    // Add New Test UI States
    const [isAddingNew, setIsAddingNew] = useState(false);
    const [newTestName, setNewTestName] = useState('');
    const [newTestPrice, setNewTestPrice] = useState('');

    // 1. Fetch Tests
    const { data: availableTests = [], isLoading } = useQuery({
        queryKey: ['availableTests'],
        queryFn: async () => {
            const { data, error } = await supabase.from('available_tests').select('*').order('name');
            if (error) throw error;
            return data as Test[];
        }
    });

    // 2. Pre-selection Logic
    useEffect(() => {
        if (availableTests.length > 0 && preSelectedTests.length > 0 && selectedTests.length === 0) {
            const matchedTests = availableTests.filter(t => preSelectedTests.includes(t.name));
            const matchedNames = matchedTests.map(t => t.name);
            setSelectedTests(matchedNames);
            setTotalAmount(matchedTests.reduce((sum, t) => sum + t.base_price, 0));
        }
    }, [availableTests, preSelectedTests, selectedTests]);

    // 3. Add New Test Mutation
    const addTestMutation = useMutation({
        mutationFn: async () => {
            if (!newTestName.trim()) throw new Error("Please enter test name");
            if (!newTestPrice || isNaN(Number(newTestPrice))) throw new Error("Please enter valid price");

            const { data, error } = await supabase.from('available_tests').insert({
                name: newTestName.trim(),
                base_price: Number(newTestPrice),
                category: 'General'
            }).select().single();

            if (error) throw error;
            return data as Test;
        },
        onSuccess: (newTest) => {
            queryClient.invalidateQueries({ queryKey: ['availableTests'] });
            // Select the new test automatically logic - handled by updating state
            setSelectedTests(prev => [...prev, newTest.name]);
            setTotalAmount(prev => prev + newTest.base_price);
            setIsAddingNew(false);
            setNewTestName('');
            setNewTestPrice('');
            alert("New test added!");
        },
        onError: (err) => alert(err.message)
    });

    // 4. Submit Assignment/Bill Mutation
    const submitMutation = useMutation({
        mutationFn: async () => {
            if (selectedTests.length === 0) throw new Error("Select at least one test.");
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) throw new Error("Not authenticated");

            const promises = selectedTests.map(async (testName) => {
                const testInfo = availableTests.find(t => t.name === testName);
                const individualPrice = testInfo ? testInfo.base_price : 0;

                if (role === 'DOCTOR') {
                    // Doctor assigning test (Medical Event)
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
                    // Diagnostic center creating bill
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
        },
        onSuccess: () => {
            alert(role === 'DOCTOR' ? "Tests assigned!" : "Invoices created!");
            onSuccess();
            onClose();
        },
        onError: (err) => alert(err.message)
    });


    // Toggle Logic
    const toggleTest = (test: Test) => {
        if (selectedTests.includes(test.name)) {
            setSelectedTests(prev => prev.filter(t => t !== test.name));
            setTotalAmount(prev => prev - test.base_price);
        } else {
            setSelectedTests(prev => [...prev, test.name]);
            setTotalAmount(prev => prev + test.base_price);
        }
    };

    const filteredTests = availableTests.filter(t =>
        t.name.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const themeColor = role === 'DOCTOR' ? '#4338ca' : '#059669';
    const bgColor = role === 'DOCTOR' ? '#EEF2FF' : '#ECFDF5';

    return (
        <div className={styles.overlay}>
            <div className={styles.modal}>
                <button onClick={onClose} className={styles.closeBtn}><X size={24} /></button>

                <div className={styles.header}>
                    <Flask size={28} color={themeColor} weight="duotone" />
                    <h2 className={styles.headerTitle} style={{ color: themeColor }}>
                        {role === 'DOCTOR' ? "Assign Tests" : "Create Bill"}
                    </h2>
                </div>

                {/* View Switcher: List vs Add New */}
                {isAddingNew ? (
                    // --- ADD NEW TEST VIEW ---
                    <div className={styles.addView}>
                        <div className={styles.addViewHeader}>
                            <button onClick={() => setIsAddingNew(false)} className={styles.backBtn}>
                                <ArrowLeft size={20} />
                            </button>
                            <h3 style={{ margin: 0, fontSize: '1.1rem' }}>Add New Test</h3>
                        </div>

                        <div className={styles.inputGroup}>
                            <label className={styles.label}>Test Name</label>
                            <input
                                className={styles.input}
                                value={newTestName}
                                onChange={(e) => setNewTestName(e.target.value)}
                                placeholder="e.g. CBC, Lipid Profile"
                            />
                        </div>

                        <div className={styles.inputGroup}>
                            <label className={styles.label}>Price (৳)</label>
                            <input
                                className={styles.input}
                                type="number"
                                value={newTestPrice}
                                onChange={(e) => setNewTestPrice(e.target.value)}
                                placeholder="e.g. 500"
                            />
                        </div>

                        <button
                            onClick={() => addTestMutation.mutate()}
                            disabled={addTestMutation.isPending}
                            className={styles.fullWidthBtn}
                            style={{ backgroundColor: '#059669' }}
                        >
                            {addTestMutation.isPending ? <Spinner className={styles.spin} size={20} /> : <><FloppyDisk size={20} /> Save & Select</>}
                        </button>
                    </div>
                ) : (
                    // --- LIST VIEW ---
                    <>
                        <div className={styles.toolbar}>
                            <input
                                className={styles.searchInput}
                                placeholder="Search tests..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
                            <button
                                onClick={() => setIsAddingNew(true)}
                                className={styles.addNewBtn}
                            >
                                <Plus size={18} /> Add New
                            </button>
                        </div>

                        {/* Test List */}
                        {isLoading ? (
                            <div className="p-4 text-center">Loading...</div>
                        ) : (
                            <div className={styles.testList}>
                                {filteredTests.length === 0 ? (
                                    <p style={{ textAlign: 'center', color: '#888', padding: '20px' }}>No tests found. Add a new one!</p>
                                ) : (
                                    filteredTests.map(test => (
                                        <div
                                            key={test.id}
                                            onClick={() => toggleTest(test)}
                                            className={`${styles.testItem} ${selectedTests.includes(test.name) ? styles.selected : ''}`}
                                        >
                                            <div className={styles.testLabel}>
                                                <input
                                                    type="checkbox"
                                                    checked={selectedTests.includes(test.name)}
                                                    readOnly
                                                    style={{ width: 16, height: 16 }}
                                                />
                                                <span>{test.name}</span>
                                            </div>
                                            <span className={styles.testPrice}>৳{test.base_price}</span>
                                        </div>
                                    ))
                                )}
                            </div>
                        )}

                        {/* Footer Info */}
                        <div className={styles.footer} style={{ background: bgColor }}>
                            <div>
                                <div className={styles.totalLabel}>Selected: <strong>{selectedTests.length}</strong></div>
                                <div className={styles.totalAmount} style={{ color: themeColor }}>Total: ৳{totalAmount}</div>
                            </div>

                            <button
                                onClick={() => submitMutation.mutate()}
                                className={styles.actionBtn}
                                disabled={submitMutation.isPending}
                                style={{ backgroundColor: themeColor }}
                            >
                                {submitMutation.isPending ? <><Spinner className={styles.spin} size={20} /> Processing...</> : <><CheckCircle size={20} /> {role === 'DOCTOR' ? 'Assign' : 'Create Bill'}</>}
                            </button>
                        </div>
                    </>
                )}
            </div>
        </div>
    );
}