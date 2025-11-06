import React, { useEffect, useState } from 'react';
import { ImageBackground } from 'react-native';
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
  TextInput,
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
  { id: '1', title: 'Recharge', amount: 200.0, date: '02/11/2025' },
  { id: '2', title: 'Supermarket Purchase', amount: -50.25, date: '03/11/2025' },
  { id: '3', title: 'Coffee', amount: -8.5, date: '01/11/2025' },
  { id: '4', title: 'Toll', amount: -18.5, date: '01/11/2025' },
  { id: '5', title: 'Parking', amount: -28.5, date: '01/11/2025' },
];

function App() {
  const isDarkMode = useColorScheme() === 'dark';
  const [screen, setScreen] = useState<'home' | 'login' | 'register'>('home');
  const [registerValue, setRegisterValue] = useState('');

  return (
    <SafeAreaProvider>
      <StatusBar barStyle={isDarkMode ? 'light-content' : 'dark-content'} />
      {screen === 'home' && (
        <ImageBackground source={require('./assets/splash-nfc.png')}
            imageStyle={{  }} style={styles.backgroundImageFull} resizeMode='cover'>

          <View style={[styles.container, { justifyContent: 'flex-end', alignItems: 'center', backgroundColor: 'rgba(0,0,0,0.2)', paddingBottom: 80 }]}>
            <Text style={{ color: '#fff', fontSize: 18, fontWeight: '500' }}>Welcome to </Text>
            <Text style={{ color: '#fff', fontSize: 32, marginBottom: 40, fontFamily: 'Manrope-Light', fontWeight: '100' }}>Klever NFC</Text>
            <TouchableOpacity style={styles.authButton} onPress={() => setScreen('login')}>
              <Text style={styles.authButtonText}>Login</Text>
            </TouchableOpacity>
            <TouchableOpacity style={[styles.authButton, { backgroundColor: 'none', borderColor: '#fff', borderWidth: 1, marginTop: 10 }]} onPress={() => setScreen('register')}>
              <Text style={[styles.authButtonText, { color: '#fff' }]}>Add your card</Text>
            </TouchableOpacity>
          </View>
        </ImageBackground>
      )}
      {screen === 'login' && <AppContent onBack={() => setScreen('home')} />}
      {screen === 'register' && (
        <View style={[styles.container, { justifyContent: 'center', alignItems: 'center' }]}> 
          <Text style={{ color: '#fff', fontSize: 18, fontWeight: 'bold', marginBottom: 32 }}>Add your NFC Virtual Card</Text>
          <View style={{ width: '100%', marginBottom: 24, backgroundColor: '#222', padding: 16, borderRadius: 24, paddingVertical: 24 }}>
            <Text style={{ color: '#fff', fontSize: 16, marginBottom: 8, fontWeight: 'bold' }}>ID</Text>
            <View style={{ borderRadius: 32, marginBottom:10, borderColor: '#4D4D4D', borderWidth: 1 }}>
              <TextInput
                style={{ color: '#fff', fontSize: 16, backgroundColor: '#111', paddingHorizontal: 12, borderRadius: 32, paddingVertical: 18 }}
                placeholder="My card ID"
                placeholderTextColor="#fff"
                value={registerValue}
                onChangeText={setRegisterValue}
              />
            </View>
          <TouchableOpacity style={styles.authButton} onPress={() => Alert.alert('Cadastro', `Nome cadastrado: ${registerValue}`)}>
            <Text style={styles.authButtonText}>Scan my card</Text>
          </TouchableOpacity>
          </View>
          <TouchableOpacity style={{ marginTop: 24 }} onPress={() => setScreen('home')}>
            <Text style={{ color: '#fff', fontSize: 16 }}>Back</Text>
          </TouchableOpacity>
        </View>
      )}
    </SafeAreaProvider>
  );
}

// Recebe onBack opcional para mostrar botão de voltar
function AppContent({ onBack }: { onBack?: () => void }) {
  const safeAreaInsets = useSafeAreaInsets();
  const [hasNFC, setHasNFC] = useState(false);
  const [nfcIsEnabled, setNfcIsEnabled] = useState(false);
  const [nfcContent, setNfcContent] = useState<string | null>(null);
  const saldo = transactions.reduce((acc, t) => acc + t.amount, 0);

  useEffect(() => {
    const checkIsSupported = async () => {
      const deviceIsSupported = await NfcManager.isSupported();

      setHasNFC(deviceIsSupported);
      console.log('NFC supported:', deviceIsSupported);
      if (deviceIsSupported) {
        await NfcManager.start();
        NfcManager.isEnabled()
          .then(setNfcIsEnabled)
          .catch(() => setNfcIsEnabled(false));

        NfcManager.setEventListener(NfcEvents.DiscoverTag, (tag: any) => {
          console.log('tag found', tag);
          setNfcContent(`${tag}`);
        });
      }
    };

    checkIsSupported();
    return () => {
      setNfcIsEnabled(false);
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


  return (
    <View style={[styles.container, { paddingTop: safeAreaInsets.top + 20}]}>
      <View style={styles.saldoContainer}>
        <Text style={styles.saldoLabel}>Available</Text>
      </View>
      <Text style={styles.saldoValor}>R$ {saldo.toFixed(2)}</Text>
      {Platform.OS === 'ios' && (
        <ImageBackground
          source={require('./assets/bg-card.png')}
          style={styles.cardBox}
          imageStyle={{ borderRadius: 16 }}
        >
          <Text style={styles.cardTitle}>NFC Virtual Card</Text>
          <Text style={styles.cardInfo}>ID: 1234 5678 9012 3456</Text>
          <Text style={styles.cardInfo}>Issuer: Klever NFC</Text>
          <Text style={styles.cardInfo}>Type: debit</Text>
        </ImageBackground>
      )}
      <Text style={styles.transacoesTitulo}>Recent Transactions</Text>
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
                <DebitIcon fill="#F84960" width={24} height={24} />
              ) : (
                <CreditIcon fill="#4EBC87" width={24} height={24} />
              )}
            </View>
            <View style={{ flex: 1, marginLeft: 12 }}>
              <Text style={styles.transacaoTitulo}>{item.title}</Text>
              <Text style={styles.transacaoData}>{item.date}</Text>
            </View>
            <Text
              style={[
                styles.transacaoValor,
                { color: item.amount < 0 ? '#F84960' : '#4EBC87' },
              ]}
            >
              R$ {item.amount.toFixed(2)}
            </Text>
          </TouchableOpacity>
        )}
      />

      <View style={styles.nfcButtonWrapperRow}>
        <TouchableOpacity
          style={[styles.nfcButton, styles.nfcButtonFlex]}
          onPress={()=> {}}
          disabled={!hasNFC || !nfcIsEnabled}
          activeOpacity={0.8}
        >
          <Text style={styles.nfcButtonText}>Recharge Card</Text>
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

const styles = StyleSheet.create({
  backgroundImageFull: {
    flex: 1, // Makes the ImageBackground fill the entire screen
  },
  cardBox: {
    backgroundColor: '#161616',
    borderRadius: 16,
    padding: 20,
    marginBottom: 20,
    alignItems: 'flex-start',
  },
  cardTitle: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 8,
    fontFamily: 'Manrope-VariableFont_wght',
  },
  cardInfo: {
    color: '#939393',
    fontSize: 12,
    marginBottom: 4,
    letterSpacing: 1.1,
    fontFamily: 'Manrope-VariableFont_wght',
  },
  nfcButtonFlex: { flex: 1 },
  container: { flex: 1, backgroundColor: '#000', paddingHorizontal: 16 , paddingBottom: 30},
  logoContainer: { alignItems: 'center', marginTop: 24, marginBottom: 16 },
  title: { fontSize: 24, fontWeight: 'bold', color: '#2DE2E6', marginTop: 8 },
  saldoContainer: {
    alignItems: 'center',
    marginBottom: 0,
    borderRadius: 12,
    paddingVertical: 2,
    paddingHorizontal: 24,
  },
  saldoLabel: { fontSize: 16, color: '#BABABA', fontFamily: 'Manrope-VariableFont_wght', fontWeight: 'bold' },
  saldoValor: {
    fontSize: 42,
    fontWeight: 'bold',
    color: '#fff',
    marginTop: 0,
    textAlign: 'center',
    marginBottom: 18,
    fontFamily: 'Manrope-VariableFont_wght',
  },
  transacoesTitulo: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 8,
    color: '#fff',
    fontFamily: 'Manrope-VariableFont_wght',
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
  nfcContentLabel: { color: '#A1A7BB', fontSize: 14, marginBottom: 4, fontFamily: 'Manrope-VariableFont_wght' },
  nfcContentText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
    textAlign: 'center',
    fontFamily: 'Manrope-VariableFont_wght',
  },
  nfcButton: {
    backgroundColor: '#fff',
    paddingVertical: 16,
    paddingHorizontal: 32,
    borderRadius: 32,
  },
  nfcButtonText: {
    color: '#000',
    fontSize: 16,
    letterSpacing: 0.5,
    textAlign: 'center',
    marginBottom: 2,
    fontFamily: 'Manrope-VariableFont_wght',
  },
  transacaoItem: {
    backgroundColor: '#161616',
    borderRadius: 12,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  transacaoIconeArea: {
    width: 32,
    height: 32,
    alignItems: 'center',
    justifyContent: 'center',
  },
  transacaoTitulo: { fontSize: 16, fontWeight: '500', color: '#fff', fontFamily: 'Manrope-VariableFont_wght' },
  transacaoData: { fontSize: 13, color: '#A1A7BB', marginTop: 2, fontFamily: 'Manrope-VariableFont_wght' },
  transacaoValor: { fontSize: 16, fontWeight: 'bold', color: '#2DE2E6', fontFamily: 'Manrope-VariableFont_wght' },
  authButton: {
    backgroundColor: '#fff',
    borderRadius: 32,
    paddingVertical: 16,
    paddingHorizontal: 32,
    alignSelf: 'center',
    marginBottom: 0,
    elevation: 2,
    width: '100%',
  },
  authButtonText: { color: '#181A20', fontSize: 16, letterSpacing: 0.5, textAlign: 'center', fontFamily: 'Manrope-VariableFont_wght' },
});

export default App;
