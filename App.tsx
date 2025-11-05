import React, { useEffect, useState } from 'react';
import {
  StatusBar,
  StyleSheet,
  useColorScheme,
  View,
  Text,
  FlatList,
  TouchableOpacity,
  Alert,
  Platform,
} from 'react-native';
import {
  SafeAreaProvider,
  useSafeAreaInsets,
} from 'react-native-safe-area-context';
import NfcManager, { NfcEvents, NfcTech, Ndef } from 'react-native-nfc-manager';
import CreditIcon from './assets/credit.svg';
import DebitIcon from './assets/debit.svg';
// import NFCLogo from './assets/nfc-logo.svg';

const transactions = [
  { id: '1', title: 'Depósito', amount: 200.0, date: '02/11/2025' },
  { id: '2', title: 'Compra Supermercado', amount: -50.25, date: '03/11/2025' },
  { id: '3', title: 'Café', amount: -8.5, date: '01/11/2025' },
  { id: '4', title: 'Pedágio', amount: -18.5, date: '01/11/2025' },
  { id: '5', title: 'Estacionamento', amount: -28.5, date: '01/11/2025' },
];

function App() {
  const isDarkMode = useColorScheme() === 'dark';
  return (
    <SafeAreaProvider>
      <StatusBar barStyle={isDarkMode ? 'light-content' : 'dark-content'} />
      <AppContent />
    </SafeAreaProvider>
  );
}

function AppContent() {
  const safeAreaInsets = useSafeAreaInsets();
  const [_, setHasNFC] = useState(false);
  const [nfcContent, setNfcContent] = useState<string | null>(null);
  const saldo = transactions.reduce((acc, t) => acc + t.amount, 0);

  useEffect(() => {
    if (Platform.OS === 'android') {
      const checkIsSupported = async () => {
        const deviceIsSupported = await NfcManager.isSupported();

        setHasNFC(deviceIsSupported);
        if (deviceIsSupported) {
          await NfcManager.start();
        }
      };

      checkIsSupported();
    }
  }, []);

  useEffect(() => {
    NfcManager.setEventListener(NfcEvents.DiscoverTag, (tag: any) => {
      console.log('tag found', tag);
      setNfcContent(`${tag}`);
    });

    return () => {
      NfcManager.setEventListener(NfcEvents.DiscoverTag, null);
    };
  }, []);

  const readTag = async () => {
    await NfcManager.registerTagEvent();
  };

  const handleTransactionPress = (item: (typeof transactions)[0]) => {
    Alert.alert(
      'Transação',
      `${item.title}\nValor: R$ ${item.amount.toFixed(2)}`,
    );
  };

  const emulateCard = async () => {
    if (Platform.OS !== 'android') {
      Alert.alert('NFC', 'Emulação NFC só é suportada no Android.');
      return;
    }
    try {
      await NfcManager.requestTechnology(NfcTech.Ndef);
      // Dados do cartão
      const cardData = {
        nome: 'MARCEL CLIENTE',
        numero: '1234 5678 9012 3456',
        validade: '12/30',
        saldo: saldo.toFixed(2),
      };
      const bytes = Ndef.encodeMessage([
        Ndef.textRecord(JSON.stringify(cardData)),
      ]);
      if (bytes) {
        await NfcManager.ndefHandler.writeNdefMessage(bytes);
        Alert.alert('NFC', 'Mensagem NFC escrita!');
      }
      await NfcManager.cancelTechnologyRequest();
    } catch {
      Alert.alert('NFC', 'Erro ao emular cartão ou operação cancelada.');
      await NfcManager.cancelTechnologyRequest();
    }
  };

  return (
    <View style={[styles.container, { paddingTop: safeAreaInsets.top }]}>
      {/* <View style={styles.logoContainer}>
        <NFCLogo width={80} height={80} />
      </View> */}
      <View style={styles.saldoContainer}>
        <Text style={styles.saldoLabel}>Saldo disponível</Text>
      </View>
      <Text style={styles.saldoValor}>R$ {saldo.toFixed(2)}</Text>
      {Platform.OS === 'ios' && (
        <View style={styles.cardBox}>
          <Text style={styles.cardTitle}>Cartão NFC Virtual</Text>
          <Text style={styles.cardInfo}>Número: 1234 5678 9012 3456</Text>
          <Text style={styles.cardInfo}>Nome: MARCEL CLIENTE</Text>
          <Text style={styles.cardInfo}>Validade: 12/30</Text>
        </View>
      )}
      <Text style={styles.transacoesTitulo}>Transações recentes</Text>
      <FlatList
        data={transactions}
        keyExtractor={item => item.id}
        style={styles.lista}
        contentContainerStyle={{ paddingBottom: 32 }}
        renderItem={({ item }) => (
          <TouchableOpacity
            style={styles.transacaoItem}
            onPress={() => handleTransactionPress(item)}
          >
            <View style={styles.transacaoIconeArea}>
              {item.amount < 0 ? (
                <DebitIcon width={24} height={24} />
              ) : (
                <CreditIcon width={24} height={24} />
              )}
            </View>
            <View style={{ flex: 1, marginLeft: 12 }}>
              <Text style={styles.transacaoTitulo}>{item.title}</Text>
              <Text style={styles.transacaoData}>{item.date}</Text>
            </View>
            <Text
              style={[
                styles.transacaoValor,
                { color: item.amount < 0 ? '#FF3B30' : '#34C759' },
              ]}
            >
              R$ {item.amount.toFixed(2)}
            </Text>
          </TouchableOpacity>
        )}
      />
      {Platform.OS === 'android' && (
        <View style={styles.nfcButtonWrapperRow}>
          <TouchableOpacity
            style={[styles.nfcButton, styles.nfcButtonFlex]}
            onPress={emulateCard}
            activeOpacity={0.8}
          >
            <Text style={styles.nfcButtonText}>Ativar NFC</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.nfcButton, styles.nfcButtonFlex, { marginLeft: 12 }]}
            onPress={readTag}
            activeOpacity={0.8}
          >
            <Text style={styles.nfcButtonText}>Ler NFC</Text>
          </TouchableOpacity>
        </View>
      )}
      {nfcContent && (
        <View style={styles.nfcContentBox}>
          <Text style={styles.nfcContentLabel}>Conteúdo lido via NFC:</Text>
          <Text style={styles.nfcContentText}>{nfcContent}</Text>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  cardBox: {
    backgroundColor: '#23263A',
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
    color: '#2DE2E6',
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
  container: { flex: 1, backgroundColor: '#181A20', paddingHorizontal: 20 },
  logoContainer: { alignItems: 'center', marginTop: 24, marginBottom: 16 },
  title: { fontSize: 24, fontWeight: 'bold', color: '#2DE2E6', marginTop: 8 },
  saldoContainer: {
    alignItems: 'center',
    marginBottom: 0,
    borderRadius: 12,
    paddingVertical: 12,
    paddingHorizontal: 24,
    shadowColor: '#000',
    shadowOpacity: 0.03,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 1 },
    elevation: 1,
  },
  saldoLabel: { fontSize: 16, color: '#A1A7BB' },
  saldoValor: {
    fontSize: 54,
    fontWeight: 'bold',
    color: '#2DE2E6',
    marginTop: 0,
    letterSpacing: 1.2,
    textAlign: 'center',
    marginBottom: 18,
  },
  transacoesTitulo: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 8,
    color: '#fff',
  },
  lista: { flex: 1 },
  nfcButtonWrapperRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 24,
    marginTop: 8,
  },
  nfcContentBox: {
    backgroundColor: '#23263A',
    borderRadius: 12,
    padding: 16,
    marginHorizontal: 8,
    marginBottom: 16,
    alignItems: 'center',
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
    backgroundColor: '#23263A',
    borderRadius: 12,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
    shadowColor: '#000',
    shadowOpacity: 0.03,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 1 },
    elevation: 1,
  },
  transacaoIconeArea: {
    width: 32,
    height: 32,
    alignItems: 'center',
    justifyContent: 'center',
  },
  transacaoTitulo: { fontSize: 16, fontWeight: '500', color: '#fff' },
  transacaoData: { fontSize: 13, color: '#A1A7BB', marginTop: 2 },
  transacaoValor: { fontSize: 16, fontWeight: 'bold', color: '#2DE2E6' },
});

export default App;
