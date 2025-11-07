import { useState } from "react"
import { View, Text, StyleSheet, TouchableOpacity, FlatList } from 'react-native';

import LinearGradient from 'react-native-linear-gradient';
import {
    useSafeAreaInsets,
} from 'react-native-safe-area-context';
import Modal from 'react-native-modal';

import Parking from "../components/PaymentModal"
import QrModal from "../components/QrModal"
import ReadModal from "../components/ReadModal"

const transactions = [
    { id: 'parking', title: 'Parking Lot' },
    { id: 'balance', title: 'Check my Balance' },
    { id: 'recharge', title: 'Add/Recharge my Card' },
];

function HomeScreen() {
    const safeAreaInsets = useSafeAreaInsets();
    const [selectedId, setSelectedId] = useState<string | null>(null);
    const [showParkingReadingModal, setShowParkingReadingModal] = useState(false);
    const [showBalance, setShowBalance] = useState(false);
    const [showQrModal, setShowQrModal] = useState(false);

    const handleTransactionPress = async (item: (typeof transactions)[0]) => {
        switch (item.id) {
            case "parking":
                setShowParkingReadingModal(true);
                break

            case "balance":
                setShowBalance(true)
                break

            case "recharge":
                setShowQrModal(true)
                break
        }
    };

    return (
        <View style={[styles.container, { paddingTop: safeAreaInsets.top }]}>
            <LinearGradient
                colors={['#161616', '#000']}
                start={{ x: 0.5, y: 0 }}
                end={{ x: 0.5, y: 1 }}
                style={{
                    ...StyleSheet.absoluteFillObject,
                    zIndex: -1,
                }}
                useAngle={true}
                angle={120}
            />

            <View style={styles.saldoContainer}>
                <Text style={styles.saldoLabel}>Parking</Text>
                <Text style={styles.saldoValor}>R$ {Number(5).toFixed(2)}</Text>
            </View>

            <FlatList
                data={transactions}
                keyExtractor={item => item.id}
                style={styles.lista}
                contentContainerStyle={{ paddingBottom: 32 }}
                renderItem={({ item }) => {
                    return (
                        <TouchableOpacity
                            style={[
                                styles.transacaoItem,
                                item.id === selectedId && styles.transacaoItemSelected,
                            ]}
                            onPress={() => handleTransactionPress(item)}
                        >
                            <View style={{ flex: 1, marginLeft: 12 }}>
                                <Text style={styles.transacaoTitulo}>{item.title}</Text>
                            </View>

                            {item?.amount && (
                                <Text
                                    style={[
                                        styles.transacaoValor,
                                        item.id === selectedId
                                            ? { color: '#fff' }
                                            : { color: item.amount < 0 ? '#fff' : '#fff' },
                                    ]}
                                >
                                    R$ {item?.amount.toFixed(2)}
                                </Text>
                            )}
                        </TouchableOpacity>
                    );
                }}
            />

            <Modal
                isVisible={showParkingReadingModal}
                onBackdropPress={() => setShowParkingReadingModal(false)}
            >
                <Parking onClose={() => setShowParkingReadingModal(false)} />
            </Modal>

            <Modal
                isVisible={showBalance}
                onBackdropPress={() => setShowBalance(false)}
            >
                <ReadModal onClose={() => setShowBalance(false)} />
            </Modal>

            <Modal
                isVisible={showQrModal}
                onBackdropPress={() => setShowQrModal(false)}
            >
                <QrModal onClose={() => setShowQrModal(false)} />
            </Modal>


        </View>
    );
}

const styles = StyleSheet.create({
    rechargeItem: {
        backgroundColor: '#161616',
        borderRadius: 32,
        padding: 26,
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 12,
        borderWidth: 1,
        borderColor: '#fff',
        paddingVertical: 18,
    },
    rechargeTitle: {
        fontSize: 16,
        color: '#fff',
    },
    rechargeIcon: {
        fontSize: 24,
        marginLeft: 8,
        color: '#181A20',
    },
    qrModalCentered: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        zIndex: 30,
        backgroundColor: 'rgba(24,26,32,0.85)',
    },
    qrBox: {
        backgroundColor: '#fff',
        borderRadius: 16,
        padding: 32,
        alignItems: 'center',
        minWidth: 280,
        maxWidth: 340,
    },
    qrTitle: {
        fontSize: 20,
        fontWeight: 'bold',
        color: '#181A20',
        marginBottom: 18,
        textAlign: 'center',
    },
    qrFakeCode: {
        backgroundColor: '#fff',
        borderRadius: 8,
        padding: 24,
        marginBottom: 18,
        alignItems: 'center',
        justifyContent: 'center',
        minWidth: 180,
    },
    qrButton: {
        backgroundColor: '#161616',
        paddingVertical: 12,
        paddingHorizontal: 32,
        borderRadius: 32,
        width: '100%',
    },
    qrButtonText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: 'bold',
        textAlign: 'center',
    },
    failureModalCentered: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        zIndex: 20,
        backgroundColor: '#161616',
    },
    failureBox: {
        backgroundColor: '#FF3B30',
        borderRadius: 16,
        padding: 32,
        alignItems: 'center',
        minWidth: 280,
        maxWidth: 340,
    },
    failureTitle: {
        fontSize: 22,
        fontWeight: 'bold',
        color: '#fff',
        marginBottom: 12,
        textAlign: 'center',
    },
    failureMessage: {
        fontSize: 16,
        color: '#fff',
        marginBottom: 18,
        textAlign: 'center',
    },
    failureButton: {
        backgroundColor: '#fff',
        paddingVertical: 12,
        paddingHorizontal: 32,
        borderRadius: 32,
        width: '100%',
    },
    failureButtonText: {
        color: '#FF3B30',
        fontSize: 16,
        fontWeight: 'bold',
        textAlign: 'center',
    },
    successModalCentered: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        zIndex: 10,
        backgroundColor: '#161616',
    },
    cardBox: {
        backgroundColor: '#161616',
        borderRadius: 16,
        padding: 20,
        marginBottom: 20,
        alignItems: 'flex-start',
        shadowColor: '#000',
        shadowOpacity: 0.06,
        shadowRadius: 6,
        shadowOffset: { width: 0, height: 2 },
        elevation: 2,
    },
    cardTitle: {
        color: '#fff',
        fontSize: 18,
        fontWeight: 'bold',
        marginBottom: 8,
    },
    cardInfo: {
        color: '#fff',
        fontSize: 12,
        marginBottom: 4,
        letterSpacing: 1.1,
    },
    nfcButtonFlex: { flex: 1 },
    container: { flex: 1, paddingHorizontal: 20 },
    logoContainer: { alignItems: 'center', marginTop: 24, marginBottom: 16 },
    title: { fontSize: 24, fontWeight: 'bold', color: '#2DE2E6', marginTop: 8 },
    saldoContainer: {
        alignItems: 'center',
        marginBottom: 0,
        borderRadius: 12,
        paddingVertical: 12,
        paddingHorizontal: 24,
        marginTop: 40, // margem superior para afastar do topo
    },
    saldoLabel: { fontSize: 16, color: '#A1A7BB', fontFamily: 'Manrope-Regular' },
    saldoValor: {
        fontSize: 54,
        fontWeight: 'bold',
        color: '#fff',
        marginTop: 0,
        letterSpacing: 1.2,
        textAlign: 'center',
        marginBottom: 18,
        fontFamily: 'Manrope-Regular',
    },
    transacoesTitulo: {
        fontSize: 18,
        fontWeight: '600',
        marginBottom: 8,
        color: '#fff',
    },
    lista: {
        flex: 1,
        marginTop: 32,
        marginBottom: 32,
    },
    nfcButtonWrapperRow: {
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 24,
        marginTop: 8,
        position: 'absolute',
        left: 0,
        right: 0,
        bottom: 16,
    },
    nfcContentBox: {
        backgroundColor: '#23263A',
        borderRadius: 12,
        padding: 16,
        marginHorizontal: 8,
        marginBottom: 16,
        alignItems: 'center',
        display: 'none',
    },
    nfcContentLabel: { color: '#A1A7BB', fontSize: 14, marginBottom: 4 },
    nfcContentText: {
        color: '#2DE2E6',
        fontSize: 16,
        fontWeight: 'bold',
        textAlign: 'center',
    },
    nfcButton: {
        backgroundColor: '#2DE2E6',
        paddingVertical: 16,
        paddingHorizontal: 32,
        borderRadius: 32,
        shadowColor: '#2DE2E6',
        shadowOpacity: 0.15,
        shadowRadius: 8,
        shadowOffset: { width: 0, height: 2 },
        elevation: 2,
    },
    nfcButtonText: {
        color: '#181A20',
        fontSize: 16,
        fontWeight: 'bold',
        letterSpacing: 0.5,
        textAlign: 'center',
        marginBottom: 2,
    },
    transacaoItem: {
        backgroundColor: '#161616',
        padding: 26,
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 12,
        borderRadius: 60,
        width: '100%',
        borderColor: '#fff',
        borderWidth: 1,
        paddingVertical: 18,
    },
    transacaoItemSelected: {
        backgroundColor: '#161616',
        borderRadius: 60,
        width: '100%',
        borderColor: '#fff',
        borderWidth: 1,
    },
    transacaoIconeArea: {
        width: 32,
        height: 32,
        alignItems: 'center',
        justifyContent: 'center',
    },
    transacaoTitulo: {
        fontSize: 16,
        fontWeight: '500',
        color: '#fff',
        fontFamily: 'Manrope-Regular',
    },
    transacaoData: { fontSize: 13, color: '#A1A7BB', marginTop: 2 },
    transacaoValor: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#2DE2E6',
        fontFamily: 'Manrope-Regular',
    },
    loadingBox: {
        alignItems: 'center',
        justifyContent: 'center',
        padding: 40,
        marginVertical: 24,
        backgroundColor: '#161616',
        borderRadius: 16,
        width: '100%',
    },
    loadingText: {
        fontSize: 18,
        color: '#fff',
        marginBottom: 8,
        fontFamily: 'Manrope-Regular',
    },
    successBox: {
        alignItems: 'center',
        justifyContent: 'center',
        padding: 32,
        marginVertical: 24,
        backgroundColor: '#34C759',
        borderRadius: 16,
        width: 280,
    },
    successCircle: {
        width: 64,
        height: 64,
        borderRadius: 32,
        backgroundColor: '#fff',
        marginBottom: 16,
        alignItems: 'center',
        justifyContent: 'center',
    },
    successText: {
        fontSize: 20,
        color: '#fff',
        fontWeight: 'bold',
        textAlign: 'center',
        fontFamily: 'Manrope-Regular',
    },
    detailsBox: {
        backgroundColor: '#161616',
        borderRadius: 16,
        padding: 32,
        marginVertical: 0,
        alignItems: 'flex-start',
        justifyContent: 'center',
        minWidth: 380,
        maxWidth: '100%',
    },
    detailsSuccessTitle: {
        fontSize: 24,
        fontWeight: 'bold',
        color: '#34C759',
        marginBottom: 12,
        textAlign: 'center',
    },
    detailsTitle: {
        fontSize: 20,
        fontWeight: 'bold',
        color: '#fff',
        marginBottom: 18,
        fontFamily: 'Manrope-Regular',
    },
    detailsLabel: {
        fontSize: 14,
        color: '#A1A7BB',
        marginTop: 8,
        fontFamily: 'Manrope-Regular',
    },
    detailsValue: {
        fontSize: 16,
        color: '#fff',
        fontWeight: 'bold',
        marginBottom: 4,
        fontFamily: 'Manrope-Regular',
    },
    detailsButtonWrapper: {
        alignItems: 'center',
        justifyContent: 'center',
    },
    detailsButton: {
        marginTop: 0,
        backgroundColor: '#161616',
        paddingVertical: 16,
        paddingHorizontal: 32,
        borderRadius: 32,
        width: '100%',
        borderColor: '#fff',
        borderWidth: 1,
    },
    detailsButtonText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: 'bold',
        textAlign: 'center',
    },
});

export default HomeScreen