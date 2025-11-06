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
import QRCode from 'react-native-qrcode-svg';
import {
  SafeAreaProvider,
  useSafeAreaInsets,
} from 'react-native-safe-area-context';
import NfcManager, { NfcEvents, NfcTech, Ndef } from 'react-native-nfc-manager';
import BootSplash from 'react-native-bootsplash';

const transactions = [
  { id: '1', title: 'Parking Lot', amount: 200.0 },
  { id: '3', title: 'Coffee', amount: 8.5 },

  { id: 'balance', title: 'Ver Saldo', amount: 0 },
  { id: 'recharge', title: 'Recarga de Cartão', amount: 0 },
];

// Remover hooks do escopo global, mover para AppContent

const decodeNdefRecord = (record: any) => {
  if (Ndef.isType(record, Ndef.TNF_WELL_KNOWN, Ndef.RTD_TEXT)) {
    return ['text', Ndef.text.decodePayload(record.payload)];
  }
  if (Ndef.isType(record, Ndef.TNF_WELL_KNOWN, Ndef.RTD_URI)) {
    return ['uri', Ndef.uri.decodePayload(record.payload)];
  }

  return ['unknown', '---'];
};

function App() {
  const [showBalanceModal, setShowBalanceModal] = useState(false);
  const [balanceInfo, setBalanceInfo] = useState<{
    cardId: string;
    saldo: number;
  } | null>(null);
  const [rechargeLoading, setRechargeLoading] = useState(false);
  const [showReadingModal, setShowReadingModal] = useState(false);
  const [readingType, setReadingType] = useState<'recharge' | 'balance' | null>(
    null,
  );
  const [showQrModal, setShowQrModal] = useState(false);
  const [qrCodeValue, setQrCodeValue] = useState('');
  const isDarkMode = useColorScheme() === 'dark';

  // Função para ler saldo do cartão
  const handleCheckBalance = async () => {
    setReadingType('balance');
    setShowReadingModal(true);
    setRechargeLoading(true);
    try {
      const { readCardForRecharge } = await import('./service/nfcService');
      setTimeout(async () => {
        // Simula saldo aleatório
        const result = await readCardForRecharge();
        setBalanceInfo({
          cardId: result.cardId,
          saldo: Math.floor(Math.random() * 1000) / 10,
        });
        setShowBalanceModal(true);
        setShowReadingModal(false);
        setRechargeLoading(false);
      }, 1500);
    } catch (err) {
      setBalanceInfo(null);
      setShowBalanceModal(true);
      setShowReadingModal(false);
      setRechargeLoading(false);
    }
  };
  // Simula leitura do cartão para recarga
  const handleRecharge = async () => {
    setReadingType('recharge');
    setShowReadingModal(true);
    setRechargeLoading(true);
    try {
      const { readCardForRecharge } = await import('./service/nfcService');
      setTimeout(async () => {
        const result = await readCardForRecharge();
        setQrCodeValue(`https://recarga.exemplo.com/card?id=${result.cardId}`);
        setShowQrModal(true);
        setShowReadingModal(false);
        setRechargeLoading(false);
      }, 1500);
    } catch (err) {
      setQrCodeValue('Erro ao ler cartão');
      setShowQrModal(true);
      setShowReadingModal(false);
      setRechargeLoading(false);
    }
  };

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
      <AppContent
        handleRecharge={handleRecharge}
        showQrModal={showQrModal}
        qrCodeValue={qrCodeValue}
        setShowQrModal={setShowQrModal}
        rechargeLoading={rechargeLoading}
        showBalanceModal={showBalanceModal}
        setShowBalanceModal={setShowBalanceModal}
        balanceInfo={balanceInfo}
        setBalanceInfo={setBalanceInfo}
        setRechargeLoading={setRechargeLoading}
        setShowReadingModal={setShowReadingModal}
        setReadingType={setReadingType}
      />
      {/* Modais globais, como leitura de saldo/recarga */}
      {showReadingModal && (
        <View style={styles.qrModalCentered}>
          <View style={styles.qrBox}>
            <Text style={styles.qrTitle}>
              {readingType === 'recharge'
                ? 'Aproxime o cartão para recarga'
                : 'Aproxime o cartão para consultar saldo'}
            </Text>
            <Text
              style={{
                fontSize: 16,
                color: '#181A20',
                marginBottom: 18,
                textAlign: 'center',
              }}
            >
              O cartão está sendo lido...
            </Text>
            <View style={{ alignItems: 'center', marginBottom: 12 }}>
              <Text style={{ fontSize: 40 }}>📲</Text>
            </View>
          </View>
        </View>
      )}
      {/* Modal de saldo */}
      {showBalanceModal && (
        <View style={styles.qrModalCentered}>
          <View style={styles.qrBox}>
            <Text style={styles.qrTitle}>Informações do Cartão</Text>
            {balanceInfo ? (
              <>
                <Text
                  style={{ fontSize: 18, color: '#181A20', marginBottom: 8 }}
                >
                  <Text style={{ fontWeight: 'bold' }}>ID do Usuário: </Text>
                  {balanceInfo.cardId}
                </Text>
                <Text
                  style={{ fontSize: 18, color: '#181A20', marginBottom: 18 }}
                >
                  <Text style={{ fontWeight: 'bold' }}>Saldo: </Text>
                  R$ {balanceInfo.saldo.toFixed(2)}
                </Text>
              </>
            ) : (
              <Text
                style={{ fontSize: 16, color: '#FF3B30', marginBottom: 18 }}
              >
                Erro ao ler cartão
              </Text>
            )}
            <TouchableOpacity
              style={styles.qrButton}
              onPress={() => setShowBalanceModal(false)}
            >
              <Text style={styles.qrButtonText}>Fechar</Text>
            </TouchableOpacity>
          </View>
        </View>
      )}
      {/* Modal QRCode sempre fora do fluxo da lista para garantir sobreposição */}
      {showQrModal && (
        <View style={styles.qrModalCentered}>
          <View style={styles.qrBox}>
            <Text style={styles.qrTitle}>
              Escaneie o QRCode para recarregar
            </Text>
            <View style={styles.qrFakeCode}>
              <QRCode
                value={qrCodeValue || ' '}
                size={180}
                backgroundColor="#2DE2E6"
                color="#181A20"
              />
            </View>
            <TouchableOpacity
              style={styles.qrButton}
              onPress={() => setShowQrModal(false)}
            >
              <Text style={styles.qrButtonText}>Fechar</Text>
            </TouchableOpacity>
          </View>
        </View>
      )}
    </SafeAreaProvider>
  );
}

export type AppContentProps = {
  handleRecharge: () => void;
  showQrModal: boolean;
  qrCodeValue: string;
  setShowQrModal: React.Dispatch<React.SetStateAction<boolean>>;
  rechargeLoading: boolean;
  showBalanceModal: boolean;
  setShowBalanceModal: React.Dispatch<React.SetStateAction<boolean>>;
  balanceInfo: { cardId: string; saldo: number } | null;
  setBalanceInfo: React.Dispatch<
    React.SetStateAction<{ cardId: string; saldo: number } | null>
  >;
  setRechargeLoading: React.Dispatch<React.SetStateAction<boolean>>;
  setShowReadingModal: React.Dispatch<React.SetStateAction<boolean>>;
  setReadingType: React.Dispatch<
    React.SetStateAction<'recharge' | 'balance' | null>
  >;
};

function AppContent({
  handleRecharge,
  showQrModal,
  qrCodeValue,
  setShowQrModal,
  rechargeLoading,
  showBalanceModal,
  setShowBalanceModal,
  balanceInfo,
  setBalanceInfo,
  setRechargeLoading,
  setShowReadingModal,
  setReadingType,
}: AppContentProps) {
  const safeAreaInsets = useSafeAreaInsets();
  const [hasNFC, setHasNFC] = useState(false);
  const [nfcIsEnabled, setNfcIsEnabled] = useState(false);
  const [isValidate, setIsValidate] = useState(false);
  const [nfcContent, setNfcContent] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [showFailureModal, setShowFailureModal] = useState(false);
  const [failureMessage, setFailureMessage] = useState('');
  const [selectedId, setSelectedId] = useState<string | null>(null); // novo estado
  const [saldo, setSaldo] = useState(0);
  const [showDetails, setShowDetails] = useState(false);
  const [transactionHash, setTransactionHash] = useState<string | null>(null);
  const [showParkingReadingModal, setShowParkingReadingModal] = useState(false);
  const [showCoffeeReadingModal, setShowCoffeeReadingModal] = useState(false);

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
    setShowDetails(false);
    try {
      const result = await simulateNfcService(selectedId || undefined);
      setLoading(false);
      if (result.success) {
        setShowSuccess(true);
        // Gera hash simples
        const hash = Math.random().toString(36).substring(2, 12).toUpperCase();
        setTransactionHash(hash);
        setTimeout(() => {
          setShowSuccess(false);
          setShowDetails(true);
        }, 4000); // tela de sucesso por 4s, depois mostra detalhes
        setNfcContent('Leitura NFC simulada com sucesso!');
        return;
      } else {
        setFailureMessage(
          result.error || 'Não foi possível efetuar a transação.',
        );
        setShowFailureModal(true);
      }
    } catch (error) {
      setFailureMessage('Falha inesperada na simulação do serviço NFC');
      setShowFailureModal(true);
    }
  };

  const handleTransactionPress = async (item: (typeof transactions)[0]) => {
    setSelectedId(item.id);
    setSaldo(item.amount);
    if (item.id === '1') {
      setShowParkingReadingModal(true);
      setTimeout(async () => {
        setShowParkingReadingModal(false);
        await fakeReadTag();
      }, 1500);
    } else if (item.id === '3') {
      setShowCoffeeReadingModal(true);
      setTimeout(async () => {
        setShowCoffeeReadingModal(false);
        await fakeReadTag();
      }, 1500);
    } else {
      // fluxo normal para outros itens
    }
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

  const handleCheckBalanceLocal = async () => {
    setReadingType('balance');
    setShowReadingModal(true);
    setRechargeLoading(true);
    try {
      const { readCardForRecharge } = await import('./service/nfcService');
      setTimeout(async () => {
        // Simula saldo aleatório
        const result = await readCardForRecharge();
        setBalanceInfo({
          cardId: result.cardId,
          saldo: Math.floor(Math.random() * 1000) / 10,
        });
        setShowBalanceModal(true);
        setShowReadingModal(false);
        setRechargeLoading(false);
      }, 1500);
    } catch (err) {
      setBalanceInfo(null);
      setShowBalanceModal(true);
      setShowReadingModal(false);
      setRechargeLoading(false);
    }
  };

  return (
    <View style={[styles.container, { paddingTop: safeAreaInsets.top }]}>
      {/* <View style={styles.logoContainer}>
        <NFCLogo width={80} height={80} />
      </View> */}
      {/* Remover saldo da tela de detalhes e confirmação */}
      {!showDetails && !showSuccess && (
        <View style={styles.saldoContainer}>
          <Text style={styles.saldoLabel}>Amount to pay</Text>
          <Text style={styles.saldoValor}>R$ {saldo.toFixed(2)}</Text>
        </View>
      )}
      {/* {!loading && (
        <Text style={styles.transacoesTitulo}>Transações recentes</Text>
      )} */}
      {showDetails ? (
        <TransactionDetails
          transaction={transactions.find(t => t.id === selectedId)}
          hash={transactionHash}
          onBack={() => setShowDetails(false)}
        />
      ) : showSuccess ? (
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
          renderItem={({ item }) => {
            if (item.id === 'recharge') {
              return (
                <TouchableOpacity
                  style={styles.rechargeItem}
                  onPress={handleRecharge}
                  disabled={rechargeLoading}
                >
                  <View style={{ flex: 1, marginLeft: 12 }}>
                    <Text style={styles.rechargeTitle}>{item.title}</Text>
                  </View>
                </TouchableOpacity>
              );
            }
            if (item.id === 'balance') {
              return (
                <TouchableOpacity
                  style={styles.rechargeItem}
                  onPress={handleCheckBalanceLocal}
                  disabled={rechargeLoading}
                >
                  <View style={{ flex: 1, marginLeft: 12 }}>
                    <Text style={styles.rechargeTitle}>{item.title}</Text>
                  </View>
                </TouchableOpacity>
              );
            }
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
            );
          }}
        />
      )}
      {/* Modal de leitura para Parking Lot */}
      {showParkingReadingModal && (
        <View style={styles.qrModalCentered}>
          <View style={styles.qrBox}>
            <Text style={styles.qrTitle}>
              Aproxime o cartão para pagamento de estacionamento
            </Text>
            <Text
              style={{
                fontSize: 16,
                color: '#181A20',
                marginBottom: 18,
                textAlign: 'center',
              }}
            >
              O cartão está sendo lido...
            </Text>
            <View style={{ alignItems: 'center', marginBottom: 12 }}>
              <Text style={{ fontSize: 40 }}>🅿️📲</Text>
            </View>
          </View>
        </View>
      )}
      {/* Modal de leitura para Coffee */}
      {showCoffeeReadingModal && (
        <View style={styles.qrModalCentered}>
          <View style={styles.qrBox}>
            <Text style={styles.qrTitle}>
              Aproxime o cartão para pagar o café
            </Text>
            <Text
              style={{
                fontSize: 16,
                color: '#181A20',
                marginBottom: 18,
                textAlign: 'center',
              }}
            >
              O cartão está sendo lido...
            </Text>
            <View style={{ alignItems: 'center', marginBottom: 12 }}>
              <Text style={{ fontSize: 40 }}>☕📲</Text>
            </View>
          </View>
        </View>
      )}
      {/* Modal QRCode sempre fora do fluxo da lista para garantir sobreposição */}
      {showQrModal && (
        <View style={styles.qrModalCentered}>
          <View style={styles.qrBox}>
            <Text style={styles.qrTitle}>
              Escaneie o QRCode para recarregar
            </Text>
            <View style={styles.qrFakeCode}>
              <QRCode
                value={qrCodeValue || ' '}
                size={180}
                backgroundColor="#2DE2E6"
                color="#181A20"
              />
            </View>
            <TouchableOpacity
              style={styles.qrButton}
              onPress={() => setShowQrModal(false)}
            >
              <Text style={styles.qrButtonText}>Fechar</Text>
            </TouchableOpacity>
          </View>
        </View>
      )}
      {/* Modal de falha */}
      {showFailureModal && (
        <View style={styles.failureModalCentered}>
          <View style={styles.failureBox}>
            <Text style={styles.failureTitle}>Falha na transação</Text>
            <Text style={styles.failureMessage}>{failureMessage}</Text>
            <TouchableOpacity
              style={styles.failureButton}
              onPress={() => {
                setShowFailureModal(false);
                setShowSuccess(false);
                setShowDetails(false);
                setLoading(false);
                setSelectedId(null);
                setSaldo(0);
                setTransactionHash(null);
                setNfcContent(null);
              }}
            >
              <Text style={styles.failureButtonText}>Fechar</Text>
            </TouchableOpacity>
          </View>
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
    <View style={styles.successModalCentered}>
      <View style={styles.successBox}>
        <View style={[styles.successCircle, { transform: [{ scale }] }]} />
        <Text style={styles.successText}>Pagamento efetuado com sucesso!</Text>
      </View>
    </View>
  );
}

// Componente de detalhes da transação
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
        Transação efetuada com sucesso!
      </Text>
      <View style={[styles.detailsBox, { marginTop: 24 }]}>
        <Text style={styles.detailsTitle}>Detalhes da Transação</Text>
        <Text style={styles.detailsLabel}>Item:</Text>
        <Text style={styles.detailsValue}>{transaction.title}</Text>
        <Text style={styles.detailsLabel}>Valor:</Text>
        <Text style={styles.detailsValue}>
          R$ {transaction.amount.toFixed(2)}
        </Text>
        <Text style={styles.detailsLabel}>Data:</Text>
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
          <Text style={styles.detailsButtonText}>Voltar</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  rechargeItem: {
    backgroundColor: '#2DE2E6',
    borderRadius: 12,
    padding: 26,
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
    borderWidth: 2,
    borderColor: '#34C759',
    shadowColor: '#2DE2E6',
    shadowOpacity: 0.15,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 2 },
    elevation: 2,
  },
  rechargeTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#181A20',
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
    backgroundColor: '#2DE2E6',
    borderRadius: 8,
    padding: 24,
    marginBottom: 18,
    alignItems: 'center',
    justifyContent: 'center',
    minWidth: 180,
  },
  qrButton: {
    backgroundColor: '#2DE2E6',
    paddingVertical: 12,
    paddingHorizontal: 32,
    borderRadius: 32,
    width: '100%',
  },
  qrButtonText: {
    color: '#181A20',
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
    backgroundColor: 'rgba(24,26,32,0.85)',
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
    backgroundColor: 'rgba(24,26,32,0.85)',
  },
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
  detailsBox: {
    backgroundColor: '#23263A',
    borderRadius: 16,
    padding: 32,
    marginVertical: 0,
    alignItems: 'flex-start',
    justifyContent: 'center',
    minWidth: 280,
    maxWidth: 340,
  },
  detailsSuccessTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#34C759',
    marginBottom: 12,
    textAlign: 'center',
  },
  detailsTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#2DE2E6',
    marginBottom: 18,
  },
  detailsLabel: {
    fontSize: 16,
    color: '#A1A7BB',
    marginTop: 8,
  },
  detailsValue: {
    fontSize: 18,
    color: '#fff',
    fontWeight: 'bold',
    marginBottom: 4,
  },
  detailsButtonWrapper: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  detailsButton: {
    marginTop: 0,
    backgroundColor: '#2DE2E6',
    paddingVertical: 16,
    paddingHorizontal: 32,
    borderRadius: 32,
    width: '100%',
  },
  detailsButtonText: {
    color: '#181A20',
    fontSize: 16,
    fontWeight: 'bold',
    textAlign: 'center',
  },
});

export default App;
