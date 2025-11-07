
import { View, Text, TouchableOpacity, StyleSheet } from "react-native"

function TransactionDetails({
    transaction,
    hash,
    onBack,
}: {
    transaction?: { id: string; title: string; amount: number };
    hash: string | null;
    onBack: () => void;
}) {
    if (!transaction) return null;

    const date = new Date().toLocaleDateString();
    return (
        <View
            style={{
                flex: 1,
                justifyContent: 'flex-start',
                alignItems: 'center',
                paddingTop: 48,
            }}
        >
            <Text style={[styles.detailsSuccessTitle, { marginTop: 24 }]}>
                Transaction complete!
            </Text>
            <View style={[styles.detailsBox, { marginTop: 24 }]}>
                <Text style={styles.detailsTitle}>Trasaction Details</Text>
                <Text style={styles.detailsLabel}>Item:</Text>
                <Text style={styles.detailsValue}>{transaction.title}</Text>
                <Text style={styles.detailsLabel}>Amount:</Text>
                <Text style={styles.detailsValue}>
                    R$ {transaction.amount.toFixed(2)}
                </Text>
                <Text style={styles.detailsLabel}>Date:</Text>
                <Text style={styles.detailsValue}>{date}</Text>
                <Text style={styles.detailsLabel}>Hash:</Text>
                <Text style={styles.detailsValue}>{hash}</Text>
            </View>
            <View
                style={[
                    styles.detailsButtonWrapper,
                    { position: 'absolute', left: 0, right: 0, bottom: 32 },
                ]}
            >
                <TouchableOpacity style={styles.detailsButton} onPress={onBack}>
                    <Text style={styles.detailsButtonText}>Home</Text>
                </TouchableOpacity>
            </View>
        </View>
    );
}

export default TransactionDetails


const styles = StyleSheet.create({
    detailsSuccessTitle: {
        fontSize: 24,
        fontWeight: 'bold',
        color: '#34C759',
        marginBottom: 12,
        textAlign: 'center',
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
    detailsLabel: {
        fontSize: 14,
        color: '#A1A7BB',
        marginTop: 8,
        fontFamily: 'Manrope-Regular',
    },
    detailsTitle: {
        fontSize: 20,
        fontWeight: 'bold',
        color: '#fff',
        marginBottom: 18,
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
    }
});