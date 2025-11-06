import { simulateNfcService } from './service/nfcService';
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
import BootSplash from 'react-native-bootsplash';
// import CreditIcon from './assets/credit.svg';
// import DebitIcon from './assets/debit.svg';
// import NFCLogo from './assets/nfc-logo.svg';

const transactions = [
  { id: '1', title: 'Parking Lot', amount: 200.0 },
  { id: '2', title: 'Gas', amount: 50.25 },
  { id: '3', title: 'Coffee', amount: 8.5 },
  { id: '4', title: 'Toll', amount: 18.5 },
];

const decodeNdefRecord = record => {
  if (Ndef.isType(record, Ndef.TNF_WELL_KNOWN, Ndef.RTD_TEXT)) {
    return ['text', Ndef.text.decodePayload(record.payload)];
  }
  if (Ndef.isType(record, Ndef.TNF_WELL_KNOWN, Ndef.RTD_URI)) {
    return ['uri', Ndef.uri.decodePayload(record.payload)];
  }

  return ['unknown', '---'];
};

function App() {
  const isDarkMode = useColorScheme() === 'dark';

  useEffect(() => {
    const hide = async () => {
      await BootSplash.hide({ fade: true });
      console.log('BootSplash has been hidden successfully');
    };
    hide();
  }, []);

  return (
    <SafeAreaProvider>
      <StatusBar barStyle={isDarkMode ? 'light-content' : 'dark-content'} />
      <AppContent />
    </SafeAreaProvider>
  );
}

function AppContent() {
  const safeAreaInsets = useSafeAreaInsets();
  const [hasNFC, setHasNFC] = useState(false);
  const [nfcIsEnabled, setNfcIsEnabled] = useState(false);
  const [isValidate, setIsValidate] = useState(false);
  const [nfcContent, setNfcContent] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [selectedId, setSelectedId] = useState<string | null>(null); // novo estado
  const [saldo, setSaldo] = useState(0);

  useEffect(() => {
    const checkIsSupported = async () => {
      const deviceIsSupported = await NfcManager.isSupported();

      setHasNFC(deviceIsSupported);
      if (deviceIsSupported) {
        await NfcManager.start();
      }
    };

    checkIsSupported();
  }, []);

  useEffect(() => {
    const event = (tag: any) => {
      console.log('tag found ', tag);
      console.log('record ', decodeNdefRecord(tag));
    };
    NfcManager.setEventListener(NfcEvents.DiscoverTag, event);
    NfcManager.setEventListener(NfcEvents.DiscoverBackgroundTag, event);
    NfcManager.setEventListener(NfcEvents.StateChanged, event);
    NfcManager.setEventListener(NfcEvents.SessionClosed, event);

    return () => {
      NfcManager.setEventListener(NfcEvents.DiscoverTag, null);
    };
  }, []);

  // Função que simula leitura NFC usando o serviço
  const fakeReadTag = async () => {
    setNfcContent(null);
    setLoading(true);
    setShowSuccess(false);
    try {
      const result = await simulateNfcService();
      if (result.success) {
        setLoading(false);
        setShowSuccess(true);
        setTimeout(() => {
          setShowSuccess(false);
        }, 4000); // tela de sucesso por 4s
        setNfcContent('Leitura NFC simulada com sucesso!');
        // Alert.alert('NFC', 'Leitura NFC simulada com sucesso!'); // removido
        return;
      }
    } catch (error) {
      setNfcContent('Falha na simulação do serviço NFC');
      Alert.alert('NFC', 'Falha na simulação do serviço NFC');
    }
    setLoading(false);
  };

  const handleTransactionPress = (item: (typeof transactions)[0]) => {
    setSelectedId(item.id);
    setSaldo(item.amount);
    // Alert removido
  };

  const emulateCard = async () => {
    console.log('asdasdadasas');
    if (Platform.OS !== 'android') {
      Alert.alert('NFC', 'Emulação NFC só é suportada no Android.');
      return;
    }

    try {
      console.log('Iniciando emulação NFC...');
      await NfcManager.requestTechnology(NfcTech.Ndef);
      console.log('Datasdadas ');
      // const bytes = Ndef.encodeMessage([Ndef.uriRecord('https://blog.logrocket.com/')]);

      // if (bytes) {
      //   await NfcManager.ndefHandler.writeNdefMessage(bytes);
      // }
      // await NfcManager.requestTechnology(NfcTech.Ndef);
      console.log('NFC emulação iniciada');
      // // Dados do cartão
      const cardData = {
        nome: 'MARCEL CLIENTE',
        numero: '1234 5678 9012 3456',
        validade: '12/30',
        saldo: saldo.toFixed(2),
      };
      const bytes = Ndef.encodeMessage([
        Ndef.textRecord(JSON.stringify(cardData)),
      ]);
      console.log('Card data bytes:', bytes);
      if (bytes) {
        await NfcManager.ndefHandler.writeNdefMessage(bytes);
        Alert.alert('NFC', 'Mensagem NFC escrita!');
      }
      await NfcManager.cancelTechnologyRequest();
    } catch (error: any) {
      console.error(error);
      Alert.alert(
        'NFC',
        'Erro ao emular cartão ou operação cancelada: ' +
          (error?.message || ''),
      );
      // await NfcManager.cancelTechnologyRequest();
    }
  };

  return (
    <View style={[styles.container, { paddingTop: safeAreaInsets.top }]}>
      {/* <View style={styles.logoContainer}>
        <NFCLogo width={80} height={80} />
      </View> */}
      <View style={styles.saldoContainer}>
        <Text style={styles.saldoLabel}>Amount to pay</Text>
        <Text style={styles.saldoValor}>R$ {saldo.toFixed(2)}</Text>
      </View>
      {/* {!loading && (
        <Text style={styles.transacoesTitulo}>Transações recentes</Text>
      )} */}
      {showSuccess ? (
        <SuccessScreen />
      ) : loading ? (
        <View style={styles.loadingBox}>
          <Text style={styles.loadingText}>
            Pagamento está sendo efetuado...
          </Text>
          {/* Animação simples usando três pontos piscando */}
          <LoadingDots />
        </View>
      ) : (
        <FlatList
          data={transactions}
          keyExtractor={item => item.id}
          style={styles.lista}
          contentContainerStyle={{ paddingBottom: 32 }}
          renderItem={({ item }) => (
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
              <Text
                style={[
                  styles.transacaoValor,
                  item.id === selectedId
                    ? { color: '#fff' }
                    : { color: item.amount < 0 ? '#FF3B30' : '#34C759' },
                ]}
              >
                R$ {item.amount.toFixed(2)}
              </Text>
            </TouchableOpacity>
          )}
        />
      )}
      {/* NFC Button fixo no fim da tela */}
      <View
        style={[
          styles.nfcButtonWrapperRow,
          {
            position: 'absolute',
            left: 0,
            right: 0,
            bottom: safeAreaInsets.bottom + 16,
          },
        ]}
      >
        <TouchableOpacity
          style={[styles.nfcButton, styles.nfcButtonFlex, { marginLeft: 12 }]}
          onPress={fakeReadTag}
          activeOpacity={0.8}
        >
          {isValidate ? (
            <Text style={styles.nfcButtonText}>Reading Card</Text>
          ) : (
            <Text style={styles.nfcButtonText}>Start Checkout</Text>
          )}
        </TouchableOpacity>
      </View>
      {nfcContent && (
        <View style={styles.nfcContentBox}>
          <Text style={styles.nfcContentLabel}>Conteúdo lido via NFC:</Text>
          <Text style={styles.nfcContentText}>{nfcContent}</Text>
        </View>
      )}
    </View>
  );
}

// Componente animado simples
function LoadingDots() {
  const [dotCount, setDotCount] = useState(1);
  useEffect(() => {
    const interval = setInterval(() => {
      setDotCount(prev => (prev === 3 ? 1 : prev + 1));
    }, 400);
    return () => clearInterval(interval);
  }, []);
  return <Text style={styles.loadingText}>{'.'.repeat(dotCount)}</Text>;
}

// Componente de tela de sucesso animada
function SuccessScreen() {
  const [scale, setScale] = useState(1);
  useEffect(() => {
    const interval = setInterval(() => {
      setScale(prev => (prev === 1 ? 1.2 : 1));
    }, 300);
    return () => clearInterval(interval);
  }, []);
  return (
    <View style={styles.successBox}>
      <View style={[styles.successCircle, { transform: [{ scale }] }]} />
      <Text style={styles.successText}>Pagamento efetuado com sucesso!</Text>
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
    marginTop: 40, // margem superior para afastar do topo
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
    backgroundColor: '#23263A',
    borderRadius: 12,
    padding: 26,
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  transacaoItemSelected: {
    backgroundColor: '#34C759',
    borderWidth: 2,
    borderColor: '#2DE2E6',
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
  loadingBox: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 32,
    marginVertical: 24,
    backgroundColor: '#23263A',
    borderRadius: 16,
  },
  loadingText: {
    fontSize: 18,
    color: '#2DE2E6',
    fontWeight: 'bold',
    marginBottom: 8,
  },
  successBox: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 32,
    marginVertical: 24,
    backgroundColor: '#34C759',
    borderRadius: 16,
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
  },
});

export default App;
