export type Lang = 'ky' | 'ru';

export interface Translations {
  brand: string;
  nav: {
    overview: string;
    overviewDesc: string;
    models: string;
    modelsDesc: string;
    staff: string;
    staffDesc: string;
    fabric: string;
    fabricDesc: string;
    cutting: string;
    cuttingDesc: string;
    sewing: string;
    sewingDesc: string;
    packing: string;
    packingDesc: string;
    zavsklad: string;
    zavskladDesc: string;
    dispatch: string;
    dispatchDesc: string;
    groupProduction: string;
    groupWarehouse: string;
    variant1: string;
    variant2: string;
    resetDemo: string;
    resetDemoTitle: string;
    resetDemoMsg: string;
    resetDemoBtn: string;
    openMenu: string;
    closeMenu: string;
    topDispatchBtn: string;
    topCuttingBtn: string;
    topZavskladBtn: string;
    topStaffBtn: string;
    logoutBtn: string;
    backToAdminBtn: string;
    employeeModeLabel: string;
    connectedLive: string;
    previewBanner: (name: string) => string;
  };
  common: {
    confirm: string;
    cancel: string;
    close: string;
    delete: string;
    save: string;
    add: string;
    search: string;
    pieces: string;
    kg: string;
    rolls: string;
    color: string;
    size: string;
    model: string;
    fabric: string;
    barcode: string;
    actions: string;
    date: string;
    note: string;
    clear: string;
    no: string;
  };
  overview: {
    kpiModelsFabric: string;
    kpiModelsRollsSub: (models: number, rolls: number) => string;
    kpiWorkshop: string;
    kpiWorkshopSub: (ready: number) => string;
    kpiWarehouse: string;
    kpiWarehouseSub: (models: number) => string;
    kpiShipped: string;
    kpiShippedSub: (count: number) => string;
    modelsTitle: string;
    modelsSub: string;
    addModelBtn: string;
    qrCodeBtn: string;
    viewBtn: string;
    workflowTitle: string;
    workflowSub: string;
    legendAdmin: string;
    legendProd: string;
    legendWarehouse: string;
    stageTitles: {
      models: string;
      modelsSub: string;
      modelsStat: (n: number) => string;
      fabric: string;
      fabricSub: string;
      fabricStat: (kg: string, rolls: number) => string;
      cutting: string;
      cuttingSub: string;
      cuttingStat: (n: number) => string;
      sewing: string;
      sewingSub: string;
      sewingStat: (n: number) => string;
      packing: string;
      packingSub: string;
      packingStatReady: (n: number) => string;
      packingStatDone: string;
      zavsklad: string;
      zavskladSub: string;
      zavskladStat: (n: number) => string;
      dispatch: string;
      dispatchSub: string;
      dispatchStat: (n: number) => string;
    };
    stockTitle: string;
    stockSub: string;
    goZavsklad: string;
    goDispatch: string;
    colProduct: string;
    colColorSize: string;
    colBarcode: string;
    colReceived: string;
    colShipped: string;
    colRemaining: string;
    colAction: string;
    emptyStock: string;
    lowStockLabel: string;
    dispatchBtn: string;
    lastDispatchPrefix: string;
  };
  models: {
    formTitle: string;
    formSub: string;
    errNameCode: string;
    errNoPhoto: string;
    errCamera: string;
    photoReady: string;
    retakePhoto: string;
    photoPrompt: string;
    photoHint: string;
    takePhotoBtn: string;
    chooseFileBtn: string;
    removePhotoAria: string;
    nameLabel: string;
    namePlaceholder: string;
    codeLabel: string;
    codePlaceholder: string;
    fabricLabel: string;
    fabricPlaceholder: string;
    colorLabel: string;
    colorPlaceholder: string;
    sizeLabel: string;
    sizePlaceholder: string;
    notesLabel: string;
    notesPlaceholder: string;
    submitBtn: string;
    listTitle: string;
    listSub: string;
    countLabel: (n: number) => string;
    emptyList: string;
    qrStickerBtn: string;
    openMobileBtn: string;
    addedAt: string;
    cameraModalTitle: string;
    snapBtn: string;
    deleteTitle: string;
    deleteMsg: (name: string, code: string) => string;
  };
  fabric: {
    formTitle: string;
    formSub: string;
    errNameColor: string;
    errKg: string;
    errRolls: string;
    typeLabel: string;
    typePlaceholder: string;
    colorLabel: string;
    colorPlaceholder: string;
    rollsLabel: string;
    kgLabel: string;
    kgPlaceholder: string;
    supplierLabel: string;
    supplierPlaceholder: string;
    submitBtn: string;
    listTitle: string;
    summary: (rem: string, init: string) => string;
    searchPlaceholder: string;
    goCutting: string;
    colFabric: string;
    colRolls: string;
    colInitKg: string;
    colRemKg: string;
    colReceivedAt: string;
    colDelete: string;
    emptyList: string;
    deleteTitle: string;
    deleteMsg: (name: string, color: string) => string;
  };
  cutting: {
    formTitle: string;
    formSub: string;
    errModel: string;
    errRoll: string;
    errKg: string;
    errPieces: string;
    errNotFound: string;
    errInsufficient: (rem: string) => string;
    modelSelectLabel: string;
    newModelLink: string;
    customModelOption: string;
    customModelPlaceholder: string;
    rollSelectLabel: string;
    noFabricOption: string;
    rollOption: (name: string, color: string, rem: string) => string;
    kgUsedLabel: string;
    cutPiecesLabel: string;
    remainingAfter: string;
    noteLabel: string;
    notePlaceholder: string;
    submitBtn: string;
    listTitle: string;
    listSub: string;
    goSewing: string;
    colModel: string;
    colFabric: string;
    colKgUsed: string;
    colCutPieces: string;
    colStage: string;
    colQr: string;
    emptyList: string;
    qrBtn: string;
    statuses: {
      cutting: string;
      sewing: string;
      ironing: string;
      awaiting_zavsklad: string;
      stocked: string;
    };
  };
  sewing: {
    allTab: (n: number) => string;
    addTaskBtn: string;
    goPackingBtn: string;
    modelLabel: string;
    seamstressLabel: string;
    machineLabel: string;
    piecesLabel: string;
    colorPlaceholder: string;
    listTitle: string;
    listSub: string;
    colModel: string;
    colSeamstress: string;
    colAssigned: string;
    colSewn: string;
    colDefect: string;
    colAction: string;
    emptyList: string;
    sentToPacking: string;
    editCountBtn: string;
    sendToPackingBtn: string;
    machines: Record<'Түз тигүү' | 'Распошивалка' | 'Оверлок', string>;
  };
  packing: {
    headerTitle: string;
    headerSub: string;
    manualAddBtn: string;
    goZavskladBtn: string;
    modelLabel: string;
    colorLabel: string;
    piecesLabel: string;
    colModel: string;
    colResponsible: string;
    colIncoming: string;
    colPacked: string;
    colStatus: string;
    colAction: string;
    emptyList: string;
    statusAccepted: string;
    statusAwaiting: string;
    statusPacking: string;
    editCountBtn: string;
    handOverBtn: string;
    handedOverText: string;
  };
  zavsklad: {
    incomingTitle: (n: number) => string;
    incomingSub: string;
    countedByIzat: string;
    acceptQrBtn: string;
    formTitleAccept: string;
    formTitleDirect: string;
    formSub: string;
    errNameCode: string;
    errQty: string;
    templateLabel: string;
    templateManual: string;
    nameLabel: string;
    namePlaceholder: string;
    codeLabel: string;
    colorLabel: string;
    sizeLabel: string;
    qtyLabel: string;
    barcodeLabel: string;
    regenBarcode: string;
    submitAccept: string;
    submitDirect: string;
    listTitle: string;
    summary: (total: number, models: number) => string;
    searchPlaceholder: string;
    goDispatchBtn: string;
    colProduct: string;
    colBarcode: string;
    colReceived: string;
    colShipped: string;
    colRemaining: string;
    colAction: string;
    emptyList: string;
    restockBtn: string;
    dispatchBtn: string;
    barcodeModalTitle: string;
    barcodeMeta: (color: string, size: string) => string;
    downloadPng: string;
    printBtn: string;
    deleteTitle: string;
    deleteMsg: (name: string, code: string) => string;
  };
  dispatch: {
    formTitle: string;
    formSub: string;
    errSelect: string;
    errClient: string;
    errQty: string;
    errInsufficient: (rem: number, req: number) => string;
    errNotFound: string;
    successMsg: (client: string, qty: number, name: string) => string;
    productLabel: string;
    noProductOption: string;
    productOption: (name: string, code: string, barcode: string, rem: number) => string;
    clientLabel: string;
    clientPlaceholder: string;
    containerLabel: string;
    containerPlaceholder: string;
    qtyLabel: string;
    previewCurrent: string;
    previewMinus: string;
    previewBalance: string;
    noteLabel: string;
    notePlaceholder: string;
    submitBtn: string;
    listTitle: string;
    listSub: string;
    searchPlaceholder: string;
    exportCsv: string;
    colClient: string;
    colProduct: string;
    colShipped: string;
    colBalanceAfter: string;
    colDate: string;
    colRevert: string;
    emptyList: string;
    revertBtn: string;
    revertTitle: string;
    revertMsg: (client: string, qty: number, name: string) => string;
    revertConfirmBtn: string;
    csvHeaders: string[];
  };
  qrModal: {
    titleBatch: string;
    titleModel: string;
    subtitle: string;
    generating: string;
    batchInfo: (pieces: number, id: string) => string;
    stickerHint: string;
    copyLink: string;
    copied: string;
    previewMobile: string;
    downloadPng: string;
    printBtn: string;
  };
  qrViewer: {
    notFoundTitle: string;
    notFoundMsg: string;
    goSiteBtn: string;
    backBtn: string;
    badge: string;
    noPhoto: string;
    modelPrefix: string;
    fabricLabel: string;
    stockLabel: string;
    notesTitle: string;
    noNotes: string;
    batchTitle: string;
    cutInfo: (pieces: number, kg: string) => string;
    statusLabel: string;
    recentBatches: string;
  };
  auth: {
    setupTitle: string;
    setupSub: string;
    loginTitle: string;
    loginSub: string;
    passcodeLabel: string;
    passcodePlaceholder: string;
    setupPasscodePlaceholder: string;
    confirmLabel: string;
    confirmPlaceholder: string;
    setupBtn: string;
    loginBtn: string;
    errShort: string;
    errMismatch: string;
    errInvalid: string;
    errNetwork: string;
    employeeHintTitle: string;
    employeeHintDesc: string;
    connectingTitle: string;
    connectingSub: string;
    revokedTitle: string;
    revokedSub: string;
    invalidQrTitle: string;
    invalidQrSub: string;
    disabledQrTitle: string;
    disabledQrSub: string;
    returnHomeBtn: string;
  };
  staff: {
    formTitle: string;
    formSub: string;
    errName: string;
    errGeneric: string;
    nameLabel: string;
    namePlaceholder: string;
    stageLabel: string;
    seamstressFilterLabel: string;
    seamstressAllOption: string;
    noteLabel: string;
    notePlaceholder: string;
    submitBtn: string;
    listTitle: string;
    listSummary: (total: number, connected: number, disabled: number) => string;
    refreshBtn: string;
    colEmployee: string;
    colDepartment: string;
    colStatus: string;
    colActions: string;
    emptyList: string;
    statusConnected: string;
    statusWaiting: string;
    statusDisabled: string;
    lastActivePrefix: string;
    openQrBtn: string;
    disableBtn: string;
    enableBtn: string;
    testViewBtn: string;
    deleteTitle: string;
    deleteMsg: (name: string) => string;
    qrModalTitle: string;
    qrModalSub: string;
    qrScanInstruction: string;
    qrRegenerateBtn: string;
    qrRegenerateConfirmTitle: string;
    qrRegenerateConfirmMsg: (name: string) => string;
    qrRegenerateConfirmBtn: string;
    qrPreviewAsStaffBtn: string;
    onlyOwnSectionHint: string;
    stageLabels: Record<'fabric' | 'cutting' | 'sewing' | 'packing' | 'zavsklad' | 'dispatch', string>;
  };
}

export const TRANSLATIONS: Record<Lang, Translations> = {
  ky: {
    brand: 'Дордой Склад',
    nav: {
      overview: 'Жалпы абал',
      overviewDesc: 'Баары бир экранда',
      models: '0. Админ (Модель & QR)',
      modelsDesc: 'Сүрөт тартуу, QR түзүү',
      staff: 'Сотрудниктер (QR)',
      staffDesc: 'QR туташтыруу, өчүрүү',
      fabric: '1. Кездеме склад',
      fabricDesc: 'Рулон, кг эсеби',
      cutting: '2. Бычуу (Крой QR)',
      cuttingDesc: 'Модель, рулон, крой QR',
      sewing: '3. Асель эже (Тигүү)',
      sewingDesc: '4 тигүүчү, түз, распош.',
      packing: '4. Үтүк, Изат',
      packingDesc: 'Упаковка, өткөрүү',
      zavsklad: '5. Завсклад',
      zavskladDesc: 'Саноо, штрих-код',
      dispatch: '6. Кардарга отправка',
      dispatchDesc: 'Минус, авто-калдык',
      groupProduction: 'Өндүрүш (1–4)',
      groupWarehouse: 'Склад & Сатуу (5–6)',
      variant1: 'Вариант 1',
      variant2: 'Вариант 2',
      resetDemo: 'Мисал маалыматты жаңылоо',
      resetDemoTitle: 'Баштапкы мисал маалыматтарды коюу',
      resetDemoMsg:
        'Азыркы маалыматтардын ордуна даяр мисал маалыматтар кайра жүктөлөт. Улантасызбы?',
      resetDemoBtn: 'Кайра жүктөө',
      openMenu: 'Менюну ачуу',
      closeMenu: 'Менюну жабуу',
      topDispatchBtn: 'Отправка жасоо',
      topCuttingBtn: 'Бычууга өтүү',
      topZavskladBtn: 'Завскладка өтүү',
      topStaffBtn: 'Сотрудник QR',
      logoutBtn: 'Чыгуу',
      backToAdminBtn: 'Админге кайтуу',
      employeeModeLabel: 'Сотрудник режими',
      connectedLive: 'Туташкан',
      previewBanner: (name) => `Текшерүү режими: ${name} өзүнүн гана бөлүмүн көрөт`,
    },
    common: {
      confirm: 'Ырастоо',
      cancel: 'Жокко чыгаруу',
      close: 'Жабуу',
      delete: 'Өчүрүү',
      save: 'Сактоо',
      add: 'Кошуу',
      search: 'Издөө...',
      pieces: 'даана',
      kg: 'кг',
      rolls: 'рулон',
      color: 'Түсү',
      size: 'Размер',
      model: 'Модель',
      fabric: 'Кездеме',
      barcode: 'Штрих-код',
      actions: 'Аракет',
      date: 'Дата',
      note: 'Эскертүү',
      clear: 'Тазалоо',
      no: 'Жок',
    },
    overview: {
      kpiModelsFabric: 'Моделдер & Кездеме',
      kpiModelsRollsSub: (m, r) => `${m} модель · ${r} рулон`,
      kpiWorkshop: 'Цехте (Тигүү & Үтүк)',
      kpiWorkshopSub: (r) => `${r} даана завскладка даяр`,
      kpiWarehouse: 'Складдагы калдык',
      kpiWarehouseSub: (m) => `${m} модель штрих-код менен`,
      kpiShipped: 'Кардарга кеткен товар',
      kpiShippedSub: (c) => `${c} жолу отправка жасалды`,
      modelsTitle: 'Моделдер (Сүрөт & QR код)',
      modelsSub: 'Бычмачы жана складчы телефондон QR аркылуу сүрөтүн көрөт',
      addModelBtn: '+ Жаңы модель (Фото & QR)',
      qrCodeBtn: 'QR код',
      viewBtn: 'Көрүү',
      workflowTitle: 'Иш тартиби (0–6 этап)',
      workflowSub: 'Кайсы бөлүмгө кирүү керек болсо, ошол этапты басыңыз',
      legendAdmin: 'Админ (0)',
      legendProd: 'Өндүрүш (1–4)',
      legendWarehouse: 'Дордой Склад (5–6)',
      stageTitles: {
        models: 'Админ — Модель & QR',
        modelsSub: 'Сүрөткө тартып модель түзүү, QR генерация',
        modelsStat: (n) => `${n} модель QR менен`,
        fabric: 'Кездеме склад',
        fabricSub: 'Рулон кабыл алуу, кг эсептөө',
        fabricStat: (kg, r) => `${kg} кг · ${r} рулон`,
        cutting: 'Бычуу (QR кройго)',
        cuttingSub: 'Модель, рулон, даана + кройго QR чаптоо',
        cuttingStat: (n) => `${n} партия`,
        sewing: 'Асель эже — тигүү бөлүмү',
        sewingSub: '4 тигүүчү, түз тигүү, распошивалка',
        sewingStat: (n) => `${n} даана тигилүүдө`,
        packing: 'Үтүк, упаковка, Изат',
        packingSub: 'Даяр продукцияны санап өткөрүү',
        packingStatReady: (n) => `${n} даана өткөрүүгө даяр`,
        packingStatDone: 'Баары өткөрүлдү',
        zavsklad: 'Завсклад',
        zavskladSub: 'Санайт, атын жазат, штрих-код чаптайт',
        zavskladStat: (n) => `${n} даана складда`,
        dispatch: 'Кардарга отправка',
        dispatchSub: 'Кеткен товар минус, калдык автоматтык эсептелет',
        dispatchStat: (n) => `${n} даана жөнөтүлдү`,
      },
      stockTitle: 'Складдагы даяр товар калдыгы',
      stockSub: 'Кеткен товар автоматтык кемитилип, таза калдык көрсөтүлөт',
      goZavsklad: 'Завскладга өтүү',
      goDispatch: 'Кардарга отправка',
      colProduct: 'Товардын аты / Модель',
      colColorSize: 'Түсү · Размер',
      colBarcode: 'Штрих-код',
      colReceived: 'Кирди',
      colShipped: 'Кетти',
      colRemaining: 'Калдык',
      colAction: 'Аракет',
      emptyStock: 'Складда азырынча даяр товар жок. Завсклад бөлүмүнөн кошуңуз.',
      lowStockLabel: 'Аз калды',
      dispatchBtn: 'Отправка',
      lastDispatchPrefix: 'Акыркы отправка',
    },
    models: {
      formTitle: 'Жаңы модель түзүү (Админ)',
      formSub: 'Сүрөткө тартып же жүктөп модель кошуңуз — система автоматтык QR код түзүп берет',
      errNameCode: 'Моделдин атын жана кодун жазыңыз.',
      errNoPhoto: 'Моделди сүрөткө тартыңыз же сүрөт жүктөңүз — ошол сүрөт QR кодго байланат.',
      errCamera: 'Камера ачылган жок. Сүрөттү файлдан жүктөсөңүз болот.',
      photoReady: 'Сүрөт даяр — сактаганда QR кодго байланат',
      retakePhoto: 'Кайра тартуу',
      photoPrompt: 'Кийимдин сүрөтүн тартыңыз же тандаңыз *',
      photoHint: 'Бычмачы жана складчы QR кодду сканерлегенде ушул сүрөт көрүнөт',
      takePhotoBtn: 'Сүрөткө тартуу',
      chooseFileBtn: 'Файлдан тандоо',
      removePhotoAria: 'Сүрөттү алып салуу',
      nameLabel: 'Моделдин аты *',
      namePlaceholder: 'Мисалы: Кофта-бомбер',
      codeLabel: 'Модель коду *',
      codePlaceholder: 'Мисалы: B-412',
      fabricLabel: 'Кездеме түрү',
      fabricPlaceholder: 'Футер 2-нитка',
      colorLabel: 'Түсү',
      colorPlaceholder: 'Кара / Бежевый',
      sizeLabel: 'Размерлер линейкасы',
      sizePlaceholder: 'S–XL (линейка 4 шт)',
      notesLabel: 'Тигүү / Бычуу боюнча нускама',
      notesPlaceholder: 'Мисалы: Замок металл, жакасы кашкорсе, этеги распошивалка...',
      submitBtn: 'Модель түзүү жана QR код алуу',
      listTitle: 'Түзүлгөн моделдер жана QR коддор',
      listSub: 'Бычмачы кройду бычканда ушул моделди тандап, QR кодду басып чаптайт',
      countLabel: (n) => `${n} модель`,
      emptyList: 'Азырынча модель кошула элек. Сол жактан сүрөт тартып биринчи моделди түзүңүз.',
      qrStickerBtn: 'QR чаптама',
      openMobileBtn: 'Ачуу',
      addedAt: 'Кошулду',
      cameraModalTitle: 'Моделди сүрөткө тартуу',
      snapBtn: 'Сүрөткө тартуу',
      deleteTitle: 'Моделди өчүрүү',
      deleteMsg: (name, code) => `«${name} (${code})» моделин өчүрөсүзбү?`,
    },
    fabric: {
      formTitle: 'Рулон кабыл алуу',
      formSub: 'Келген кездеменин түрүн, рулон санын жана килограммын киргизиңиз',
      errNameColor: 'Кездеменин атын жана түсүн жазыңыз.',
      errKg: 'Салмагын (кг) туура жазыңыз.',
      errRolls: 'Рулондун санын туура жазыңыз.',
      typeLabel: 'Кездеме түрү *',
      typePlaceholder: 'Мисалы: Футер 2-нитка',
      colorLabel: 'Түсү *',
      colorPlaceholder: 'Кара / Ак',
      rollsLabel: 'Рулон саны *',
      kgLabel: 'Жалпы салмагы (кг) *',
      kgPlaceholder: 'Мисалы: 48.5',
      supplierLabel: 'Кайдан алынды (Мадина / Поставщик)',
      supplierPlaceholder: 'Мисалы: Мадина №14 павильон',
      submitBtn: 'Кездеме кошуу',
      listTitle: 'Складдагы кездемелер',
      summary: (rem, init) => `Калганы: ${rem} кг / Жалпы киргени: ${init} кг`,
      searchPlaceholder: 'Издөө...',
      goCutting: 'Бычууга өтүү',
      colFabric: 'Кездеме',
      colRolls: 'Рулон',
      colInitKg: 'Келген (кг)',
      colRemKg: 'Калган (кг)',
      colReceivedAt: 'Кабыл алынды',
      colDelete: 'Өчүрүү',
      emptyList: 'Кездеме табылган жок. Сол жактан рулон кабыл алыңыз.',
      deleteTitle: 'Кездемени өчүрүү',
      deleteMsg: (name, color) => `«${name} (${color})» жазуусун тизмеден өчүрөсүзбү?`,
    },
    cutting: {
      formTitle: 'Бычуу каттоо & QR кройго',
      formSub: 'Бычып бүтөрү менен кройго чаптай турган QR код автоматтык чыгат',
      errModel: 'Моделди тандаңыз же атын жазыңыз.',
      errRoll: 'Кездеме рулонун тандаңыз.',
      errKg: 'Иштетилген кездеменин салмагын (кг) туура жазыңыз.',
      errPieces: 'Чыккан даана санын туура жазыңыз.',
      errNotFound: 'Тандалган кездеме табылган жок.',
      errInsufficient: (rem) => `Кездеме жетишсиз: складда ${rem} кг гана калды.`,
      modelSelectLabel: 'Админ түзгөн модель *',
      newModelLink: '+ Жаңы модель',
      customModelOption: 'Башка модель (кол менен жазуу)',
      customModelPlaceholder: 'Мисалы: Кофта К-201',
      rollSelectLabel: 'Кайсы кездемеден бычылды? *',
      noFabricOption: 'Складда кездеме жок',
      rollOption: (name, color, rem) => `${name} (${color}) — ${rem} кг бар`,
      kgUsedLabel: 'Кеткен кг *',
      cutPiecesLabel: 'Чыккан даана *',
      remainingAfter: 'Кездемеде калат:',
      noteLabel: 'Эскертүү (размерлер ж.б.)',
      notePlaceholder: 'Мисалы: S–XL, ар бир размерден 25 даана',
      submitBtn: 'Бычууну бүтүрүү & Кройго QR алуу',
      listTitle: 'Бычылган партиялар (Крой QR)',
      listSub: 'Ар бир бычылган кройго QR код басып чаптап, тигүүгө өткөрүңүз',
      goSewing: 'Асель эже бөлүмүнө өтүү',
      colModel: 'Модель',
      colFabric: 'Кездеме',
      colKgUsed: 'Кеткен (кг)',
      colCutPieces: 'Чыккан (даана)',
      colStage: 'Этап',
      colQr: 'Крой QR',
      emptyList: 'Азырынча бычылган партия жок.',
      qrBtn: 'QR чаптама',
      statuses: {
        cutting: 'Бычылууда',
        sewing: 'Асель эжеде (тигүү)',
        ironing: 'Үтүк / Упаковка (Изат)',
        awaiting_zavsklad: 'Завскладды күтүүдө',
        stocked: 'Завскладка кирди',
      },
    },
    sewing: {
      allTab: (n) => `Баары (${n})`,
      addTaskBtn: 'Тигүүчүгө тапшырма',
      goPackingBtn: 'Үтүк & Упаковка (Изат)',
      modelLabel: 'Модель *',
      seamstressLabel: 'Тигүүчү',
      machineLabel: 'Машина',
      piecesLabel: 'Даана *',
      colorPlaceholder: 'Түсү',
      listTitle: 'Асель эже — тигүү бөлүмү (4 тигүүчү)',
      listSub: 'Түз тигүү, распошивалка, оверлок боюнча бүткөн даана санын жазып, Изатка өткөрүңүз',
      colModel: 'Модель',
      colSeamstress: 'Тигүүчү · Машина',
      colAssigned: 'Берилди',
      colSewn: 'Тигилди',
      colDefect: 'Брак',
      colAction: 'Аракет',
      emptyList: 'Тандалган тигүүчү боюнча активдүү партия жок.',
      sentToPacking: 'Изатка өттү',
      editCountBtn: 'Санын жазуу',
      sendToPackingBtn: 'Изатка өткөрүү',
      machines: {
        'Түз тигүү': 'Түз тигүү',
        Распошивалка: 'Распошивалка',
        Оверлок: 'Оверлок',
      },
    },
    packing: {
      headerTitle: 'Үтүк, упаковка, Изат — Даяр продукцияны санап өткөрүү',
      headerSub: 'Үтүктөлүп, баштыкка салынган товарды санап «Завскладка өткөрүү» баскычын басыңыз',
      manualAddBtn: 'Кол менен кошуу',
      goZavskladBtn: 'Завскладга өтүү',
      modelLabel: 'Модель аты *',
      colorLabel: 'Түсү',
      piecesLabel: 'Даана *',
      colModel: 'Модель',
      colResponsible: 'Жооптуу',
      colIncoming: 'Тигүүдөн келди',
      colPacked: 'Таңгакталган даана',
      colStatus: 'Абалы',
      colAction: 'Аракет',
      emptyList: 'Үтүк жана упаковкада азырынча партия жок.',
      statusAccepted: 'Завсклад кабыл алды',
      statusAwaiting: 'Завскладка өткөрүлдү (күтүүдө)',
      statusPacking: 'Саналып, үтүктөлүүдө',
      editCountBtn: 'Санын тактоо',
      handOverBtn: 'Завскладка өткөрүү',
      handedOverText: 'Өткөрүлгөн',
    },
    zavsklad: {
      incomingTitle: (n) => `Изаттан келген даяр товар (${n} партия кабыл алууну күтүүдө)`,
      incomingSub: 'Санап текшерип, атын жазып, штрих-код чаптоо үчүн «Кабыл алуу» баскычын басыңыз',
      countedByIzat: 'Изат санады',
      acceptQrBtn: 'Кабыл алуу & Штрих-код',
      formTitleAccept: 'Келген товарды кабыл алуу',
      formTitleDirect: 'Складга товар киргизүү',
      formSub: 'Санайт, атын жазат, штрих-код чаптайт',
      errNameCode: 'Товардын атын жана модель кодун жазыңыз.',
      errQty: 'Товардын санын (даана) туура жазыңыз.',
      templateLabel: 'Даяр моделден тандоо (сүрөтү менен)',
      templateManual: 'Кол менен жазуу',
      nameLabel: 'Товардын аты *',
      namePlaceholder: 'Мисалы: Оверсайз футболка',
      codeLabel: 'Модель коду *',
      colorLabel: 'Түсү',
      sizeLabel: 'Размерлери',
      qtyLabel: 'Саналган даана *',
      barcodeLabel: 'Штрих-код',
      regenBarcode: 'Жаңы код түзүү',
      submitAccept: 'Складга кабыл алуу',
      submitDirect: 'Товарды складга кошуу',
      listTitle: 'Завсклад — Товарлар тизмеси',
      summary: (t, m) => `Жалпы калдык: ${t} даана · ${m} модель`,
      searchPlaceholder: 'Аты же штрих-код...',
      goDispatchBtn: 'Отправкага өтүү',
      colProduct: 'Товар / Модель',
      colBarcode: 'Штрих-код',
      colReceived: 'Кирди',
      colShipped: 'Кетти',
      colRemaining: 'Калдык',
      colAction: 'Аракет',
      emptyList: 'Товар табылган жок.',
      restockBtn: '+ Кирим',
      dispatchBtn: 'Отправка',
      barcodeModalTitle: 'Штрих-код этикеткасы',
      barcodeMeta: (color, size) => `Түсү: ${color} · Размер: ${size}`,
      downloadPng: 'PNG жүктөө',
      printBtn: 'Басып чыгаруу',
      deleteTitle: 'Товарды өчүрүү',
      deleteMsg: (name, code) => `«${name} (${code})» товарын склад тизмесинен өчүрөсүзбү?`,
    },
    dispatch: {
      formTitle: 'Кардарга отправка',
      formSub: 'Кеткен товар минус болуп, калдык автоматтык эсептелет',
      errSelect: 'Складдан товар тандаңыз.',
      errClient: 'Кардардын атын жазыңыз.',
      errQty: 'Кеткен товардын санын (даана) туура жазыңыз.',
      errInsufficient: (rem, req) => `Складда болгону ${rem} даана бар. ${req} даана жөнөтүүгө болбойт.`,
      errNotFound: 'Товар табылган жок.',
      successMsg: (client, qty, name) =>
        `${client} кардарга ${qty} даана «${name}» жөнөтүлдү. Калдык автоматтык жаңырды.`,
      productLabel: 'Товарды тандаңыз (аты же штрих-код) *',
      noProductOption: 'Складда товар жок',
      productOption: (name, code, barcode, rem) =>
        `${name} (${code}) · ${barcode} — ${rem} даана бар`,
      clientLabel: 'Кардардын аты *',
      clientPlaceholder: 'Мисалы: Айгүл эже',
      containerLabel: 'Дордой катар / Контейнер / Карго',
      containerPlaceholder: 'Мисалы: 7-проход, 24-контейнер',
      qtyLabel: 'Кеткен товардын саны (даана) *',
      previewCurrent: 'Складда бар эле:',
      previewMinus: 'Кеткен товар (минус):',
      previewBalance: 'Автоматтык калдык:',
      noteLabel: 'Эскертүү (баштык, накладка ж.б.)',
      notePlaceholder: 'Мисалы: 1 кап, толук линейка',
      submitBtn: 'Отправка жасоо (Калдык минус)',
      listTitle: 'Отправкалар журналы',
      listSub: 'Бардык кеткен товарлар жана ошол учурдагы калдык эсеби',
      searchPlaceholder: 'Кардар же товар...',
      exportCsv: 'CSV жүктөө',
      colClient: 'Кардар · Контейнер',
      colProduct: 'Товар · Штрих-код',
      colShipped: 'Кетти',
      colBalanceAfter: 'Калган калдык',
      colDate: 'Дата',
      colRevert: 'Артка кайтаруу',
      emptyList: 'Отправка тарыхы бош.',
      revertBtn: 'Кайтаруу',
      revertTitle: 'Отправканы артка кайтаруу',
      revertMsg: (client, qty, name) =>
        `${client} кардарга кеткен ${qty} даана «${name}» товарын склад калдыгына кайра кошосузбу?`,
      revertConfirmBtn: 'Складга кайтаруу',
      csvHeaders: [
        'Дата',
        'Кардар',
        'Контейнер/Дарек',
        'Товар',
        'Модель',
        'Штрих-код',
        'Кетти (даана)',
        'Калдык (даана)',
        'Эскертүү',
      ],
    },
    qrModal: {
      titleBatch: 'Кройго чаптай турган QR этикетка',
      titleModel: 'Моделдин QR коду',
      subtitle: 'Телефондон сканерлегенде моделдин сүрөтү жана маалыматы ачылат',
      generating: 'QR түзүлүүдө...',
      batchInfo: (pieces, id) => `Крой партиясы: ${pieces} даана · ${id}`,
      stickerHint: 'Телефондон QR кодду сканерлеп сүрөтүн көрүңүз',
      copyLink: 'Шилтеме',
      copied: 'Көчүрүлдү',
      previewMobile: 'Телефондо көрүү',
      downloadPng: 'PNG жүктөө',
      printBtn: 'Басып чыгаруу',
    },
    qrViewer: {
      notFoundTitle: 'Модель табылган жок',
      notFoundMsg: 'Бул QR код боюнча модель өчүрүлгөн же шилтеме туура эмес.',
      goSiteBtn: 'Склад сайтына өтүү',
      backBtn: 'Негизги сайтка кайтуу',
      badge: 'QR Модель картасы',
      noPhoto: 'Сүрөт кошула элек',
      modelPrefix: 'Модель',
      fabricLabel: 'Кездеме',
      stockLabel: 'Склад калдыгы',
      notesTitle: 'Тигүү / Бычуу нускамасы',
      noNotes: 'Кошумча нускама жазылган эмес.',
      batchTitle: 'Крой партиясы',
      cutInfo: (pieces, kg) => `Бычылды: ${pieces} даана · ${kg} кг кездеме`,
      statusLabel: 'Абалы',
      recentBatches: 'Акыркы крой партиялары',
    },
    auth: {
      setupTitle: 'Админ паролун орнотуу',
      setupSub: 'Биринчи жолу кирүүдө админ паролун түзүңүз — ошондо гана сотрудниктерге QR ача аласыз',
      loginTitle: 'Админ кирүү',
      loginSub: 'Складды башкаруу жана сотрудниктерди QR аркылуу туташтыруу үчүн паролду жазыңыз',
      passcodeLabel: 'Админ паролу (ПИН)',
      passcodePlaceholder: 'Паролду жазыңыз',
      setupPasscodePlaceholder: 'Кеминде 4 белги (мис: 1234)',
      confirmLabel: 'Паролду кайталаңыз',
      confirmPlaceholder: 'Паролду дагы бир жолу жазыңыз',
      setupBtn: 'Орнотуу жана кирүү',
      loginBtn: 'Админ болуп кирүү',
      errShort: 'Пароль кеминде 4 белгиден турушу керек.',
      errMismatch: 'Паролдор дал келген жок.',
      errInvalid: 'Пароль туура эмес. Кайра текшериңиз.',
      errNetwork: 'Серверге туташууда ката кетти. Кайра аракет кылыңыз.',
      employeeHintTitle: 'Сотрудниксизби?',
      employeeHintDesc: 'Сотрудниктерге пароль керек эмес — админ экранынан ачкан QR кодду телефон менен сканерлеп, өз бөлүмүнө кирет.',
      connectingTitle: 'QR аркылуу туташууда...',
      connectingSub: 'Сиздин бөлүмүңүз текшерилип жатат',
      revokedTitle: 'Кирүү өчүрүлдү',
      revokedSub: 'Админ сиздин кирүү укугуңузду өчүрдү же жаңы QR код түздү. Кайра туташуу үчүн админге кайрылыңыз.',
      invalidQrTitle: 'QR код жараксыз',
      invalidQrSub: 'Бул QR шилтеме эскирген же өчүрүлгөн. Админден жаңы QR код сураңыз.',
      disabledQrTitle: 'Сотрудник өчүрүлгөн',
      disabledQrSub: 'Админ бул сотрудниктин кирүүсүн убактылуу өчүрүп койгон.',
      returnHomeBtn: 'Башкы экранга кайтуу',
    },
    staff: {
      formTitle: 'Сотрудник кошуу (QR туташтыруу)',
      formSub: 'Сотрудникти кошуп, анын бөлүмүн тандаңыз — ар бир адам өзүнүн гана бөлүгүн көрөт',
      errName: 'Сотрудниктин атын жазыңыз.',
      errGeneric: 'Сактоодо ката кетти. Кайра аракет кылыңыз.',
      nameLabel: 'Сотрудниктин аты *',
      namePlaceholder: 'Мисалы: Бакыт / Гүлзат',
      stageLabel: 'Кайсы бөлүмдү гана көрөт? *',
      seamstressFilterLabel: 'Кайсы тигүүчүнүн ишин көрөт?',
      seamstressAllOption: 'Баардык 4 тигүүчү (Асель эже бөлүмү)',
      noteLabel: 'Кызматы / Эскертүү',
      notePlaceholder: 'Мисалы: Бычмачы, 2-смена',
      submitBtn: 'Сотрудник кошуу & QR ачуу',
      listTitle: 'Сотрудниктер жана QR кирүүлөр',
      listSummary: (total, connected, disabled) =>
        `Жалпы: ${total} · Туташкан: ${connected} · Өчүрүлгөн: ${disabled}`,
      refreshBtn: 'Жаңылоо',
      colEmployee: 'Сотрудник',
      colDepartment: 'Уруксат берилген бөлүм',
      colStatus: 'Абалы',
      colActions: 'Аракеттер',
      emptyList: 'Азырынча сотрудник кошула элек. Сол жактан биринчи сотрудникти кошуңуз.',
      statusConnected: 'Туташкан',
      statusWaiting: 'QR күтүүдө',
      statusDisabled: 'Өчүрүлгөн',
      lastActivePrefix: 'Акыркы аракет',
      openQrBtn: 'QR ачуу',
      disableBtn: 'Өчүрүү',
      enableBtn: 'Кайра кошуу',
      testViewBtn: 'Көрүү',
      deleteTitle: 'Сотрудникти толук өчүрүү',
      deleteMsg: (name) =>
        `«${name}» кызматкерин тизмеден толук өчүрөсүзбү? Анын телефону дароо өчүрүлөт.`,
      qrModalTitle: 'Сотрудникти туташтыруу QR коду',
      qrModalSub: 'Бул QR кодду админ ачат — сотрудник телефондон сканерлеп өз бөлүмүнө кирет',
      qrScanInstruction: 'Сотрудник телефонунун камерасы менен сканерлесин — ага өзүнүн гана бөлүмү ачылат',
      qrRegenerateBtn: 'Жаңы QR түзүү',
      qrRegenerateConfirmTitle: 'QR кодду жаңылоо',
      qrRegenerateConfirmMsg: (name) =>
        `«${name}» үчүн жаңы QR код түзүлүп, эски туташкан телефон дароо ажыратылат. Улантасызбы?`,
      qrRegenerateConfirmBtn: 'Жаңы QR түзүү',
      qrPreviewAsStaffBtn: 'Сотрудник катары көрүү',
      onlyOwnSectionHint: 'Сизге ушул гана бөлүм жеткиликтүү',
      stageLabels: {
        fabric: '1. Кездеме склад',
        cutting: '2. Бычуу (Крой QR)',
        sewing: '3. Асель эже (Тигүү)',
        packing: '4. Үтүк, Изат',
        zavsklad: '5. Завсклад',
        dispatch: '6. Кардарга отправка',
      },
    },
  },
  ru: {
    brand: 'Дордой Склад',
    nav: {
      overview: 'Общая сводка',
      overviewDesc: 'Всё на одном экране',
      models: '0. Админ (Модели & QR)',
      modelsDesc: 'Фото модели, генерация QR',
      staff: 'Сотрудники (QR)',
      staffDesc: 'Подключение по QR, отключение',
      fabric: '1. Склад ткани',
      fabricDesc: 'Приём рулонов, учёт кг',
      cutting: '2. Раскрой (QR на крой)',
      cuttingDesc: 'Модель, рулон, QR на крой',
      sewing: '3. Асель эже (Пошив)',
      sewingDesc: '4 швеи, прямостр., распош.',
      packing: '4. Утюжка, Изат',
      packingDesc: 'Упаковка, сдача на склад',
      zavsklad: '5. Завсклад',
      zavskladDesc: 'Пересчёт, штрих-код',
      dispatch: '6. Отправка клиенту',
      dispatchDesc: 'Расход и авто-остаток',
      groupProduction: 'Производство (1–4)',
      groupWarehouse: 'Склад и продажи (5–6)',
      variant1: 'Вариант 1',
      variant2: 'Вариант 2',
      resetDemo: 'Сбросить пример данных',
      resetDemoTitle: 'Загрузить пример данных заново',
      resetDemoMsg:
        'Текущие записи будут заменены стартовым примером данных. Продолжить?',
      resetDemoBtn: 'Загрузить',
      openMenu: 'Открыть меню',
      closeMenu: 'Закрыть меню',
      topDispatchBtn: 'Оформить отправку',
      topCuttingBtn: 'Перейти в раскрой',
      topZavskladBtn: 'Перейти к завскладу',
      topStaffBtn: 'Сотрудники QR',
      logoutBtn: 'Выйти',
      backToAdminBtn: 'Вернуться к админу',
      employeeModeLabel: 'Режим сотрудника',
      connectedLive: 'Подключён',
      previewBanner: (name) => `Режим проверки: ${name} видит только свой раздел`,
    },
    common: {
      confirm: 'Подтвердить',
      cancel: 'Отмена',
      close: 'Закрыть',
      delete: 'Удалить',
      save: 'Сохранить',
      add: 'Добавить',
      search: 'Поиск...',
      pieces: 'шт',
      kg: 'кг',
      rolls: 'рул.',
      color: 'Цвет',
      size: 'Размер',
      model: 'Модель',
      fabric: 'Ткань',
      barcode: 'Штрих-код',
      actions: 'Действия',
      date: 'Дата',
      note: 'Примечание',
      clear: 'Очистить',
      no: 'Нет',
    },
    overview: {
      kpiModelsFabric: 'Модели и ткань',
      kpiModelsRollsSub: (m, r) => `${m} модел. · ${r} рулонов`,
      kpiWorkshop: 'В цеху (Пошив и утюг)',
      kpiWorkshopSub: (r) => `${r} шт готово для завсклада`,
      kpiWarehouse: 'Остаток на складе',
      kpiWarehouseSub: (m) => `${m} модел. со штрих-кодом`,
      kpiShipped: 'Отправлено клиентам',
      kpiShippedSub: (c) => `${c} отправок оформлено`,
      modelsTitle: 'Модели (Фото и QR-коды)',
      modelsSub: 'Закройщик и кладовщик видят фото модели сразу при сканировании QR с телефона',
      addModelBtn: '+ Новая модель (Фото и QR)',
      qrCodeBtn: 'QR-код',
      viewBtn: 'Открыть',
      workflowTitle: 'Этапы работы (0–6)',
      workflowSub: 'Нажмите на нужный раздел, чтобы перейти к учёту',
      legendAdmin: 'Админ (0)',
      legendProd: 'Производство (1–4)',
      legendWarehouse: 'Дордой Склад (5–6)',
      stageTitles: {
        models: 'Админ — Модели и QR',
        modelsSub: 'Фотографирование модели и генерация QR',
        modelsStat: (n) => `${n} модел. с QR`,
        fabric: 'Склад ткани',
        fabricSub: 'Приём рулонов, расчёт кг',
        fabricStat: (kg, r) => `${kg} кг · ${r} рул.`,
        cutting: 'Раскрой (QR на крой)',
        cuttingSub: 'Модель, рулон, выход шт + наклейка QR на крой',
        cuttingStat: (n) => `${n} партий`,
        sewing: 'Асель эже — швейный цех',
        sewingSub: '4 швеи, прямострочка, распошивалка',
        sewingStat: (n) => `${n} шт в пошиве`,
        packing: 'Утюжка, упаковка, Изат',
        packingSub: 'Пересчёт и передача готовой продукции',
        packingStatReady: (n) => `${n} шт готово к передаче`,
        packingStatDone: 'Всё передано',
        zavsklad: 'Завсклад',
        zavskladSub: 'Считает, подписывает, клеит штрих-код',
        zavskladStat: (n) => `${n} шт на складе`,
        dispatch: 'Отправка клиенту',
        dispatchSub: 'Минус ушедший товар, авто-расчёт остатка',
        dispatchStat: (n) => `${n} шт отправлено`,
      },
      stockTitle: 'Текущий остаток готового товара',
      stockSub: 'Отправленный товар вычитается автоматически, чистый остаток обновляется сразу',
      goZavsklad: 'К завскладу',
      goDispatch: 'Отправить клиенту',
      colProduct: 'Товар / Модель',
      colColorSize: 'Цвет · Размер',
      colBarcode: 'Штрих-код',
      colReceived: 'Приход',
      colShipped: 'Расход',
      colRemaining: 'Остаток',
      colAction: 'Действие',
      emptyStock: 'На складе пока нет готового товара. Добавьте в разделе «Завсклад».',
      lowStockLabel: 'Мало осталось',
      dispatchBtn: 'Отправка',
      lastDispatchPrefix: 'Последняя отправка',
    },
    models: {
      formTitle: 'Создать модель (Админ)',
      formSub: 'Сфотографируйте или загрузите фото модели — система сразу создаст QR-код',
      errNameCode: 'Укажите название и код модели.',
      errNoPhoto: 'Сделайте фото или загрузите изображение — оно привяжется к QR-коду.',
      errCamera: 'Не удалось открыть камеру. Выберите фото из галереи.',
      photoReady: 'Фото готово — при сохранении привяжется к QR-коду',
      retakePhoto: 'Переснять',
      photoPrompt: 'Сфотографируйте или загрузите фото одежды *',
      photoHint: 'При сканировании QR с телефона закройщик и кладовщик увидят это фото',
      takePhotoBtn: 'Сделать фото',
      chooseFileBtn: 'Выбрать файл',
      removePhotoAria: 'Убрать фото',
      nameLabel: 'Название модели *',
      namePlaceholder: 'Например: Кофта-бомбер',
      codeLabel: 'Код модели *',
      codePlaceholder: 'Например: B-412',
      fabricLabel: 'Вид ткани',
      fabricPlaceholder: 'Футер 2-нитка',
      colorLabel: 'Цвет',
      colorPlaceholder: 'Чёрный / Бежевый',
      sizeLabel: 'Размерная сетка',
      sizePlaceholder: 'S–XL (линейка 4 шт)',
      notesLabel: 'Инструкция по пошиву / крою',
      notesPlaceholder: 'Например: Металл. замок, воротник кашкорсе, низ распошивалка...',
      submitBtn: 'Создать модель и получить QR-код',
      listTitle: 'Созданные модели и QR-коды',
      listSub: 'Закройщик выбирает эту модель при раскрое и клеит QR-код на крой',
      countLabel: (n) => `${n} модел.`,
      emptyList: 'Моделей пока нет. Сфотографируйте первую модель слева.',
      qrStickerBtn: 'QR наклейка',
      openMobileBtn: 'Открыть',
      addedAt: 'Создано',
      cameraModalTitle: 'Фотографирование модели',
      snapBtn: 'Снять фото',
      deleteTitle: 'Удалить модель',
      deleteMsg: (name, code) => `Удалить модель «${name} (${code})»?`,
    },
    fabric: {
      formTitle: 'Приём рулонов ткани',
      formSub: 'Укажите вид ткани, количество рулонов и общий вес в кг',
      errNameColor: 'Укажите название и цвет ткани.',
      errKg: 'Укажите корректный вес (кг).',
      errRolls: 'Укажите количество рулонов.',
      typeLabel: 'Вид ткани *',
      typePlaceholder: 'Например: Футер 2-нитка',
      colorLabel: 'Цвет *',
      colorPlaceholder: 'Чёрный / Белый',
      rollsLabel: 'Кол-во рулонов *',
      kgLabel: 'Общий вес (кг) *',
      kgPlaceholder: 'Например: 48.5',
      supplierLabel: 'Поставщик (Мадина / Рынок)',
      supplierPlaceholder: 'Например: Мадина, павильон №14',
      submitBtn: 'Добавить ткань',
      listTitle: 'Ткани на складе',
      summary: (rem, init) => `Остаток: ${rem} кг / Всего пришло: ${init} кг`,
      searchPlaceholder: 'Поиск...',
      goCutting: 'В раскрой',
      colFabric: 'Ткань',
      colRolls: 'Рулоны',
      colInitKg: 'Пришло (кг)',
      colRemKg: 'Остаток (кг)',
      colReceivedAt: 'Дата приёма',
      colDelete: 'Удалить',
      emptyList: 'Ткань не найдена. Оформите приход слева.',
      deleteTitle: 'Удалить запись о ткани',
      deleteMsg: (name, color) => `Удалить «${name} (${color})» из списка?`,
    },
    cutting: {
      formTitle: 'Учёт раскроя и QR на крой',
      formSub: 'После раскроя автоматически откроется QR-наклейка для пачки кроя',
      errModel: 'Выберите модель или введите название.',
      errRoll: 'Выберите рулон ткани.',
      errKg: 'Укажите корректный расход ткани (кг).',
      errPieces: 'Укажите количество выкроенных штук.',
      errNotFound: 'Выбранный рулон не найден.',
      errInsufficient: (rem) => `Недостаточно ткани: на складе осталось только ${rem} кг.`,
      modelSelectLabel: 'Модель от админа *',
      newModelLink: '+ Новая модель',
      customModelOption: 'Другая модель (ввести вручную)',
      customModelPlaceholder: 'Например: Кофта К-201',
      rollSelectLabel: 'Из какой ткани кроили? *',
      noFabricOption: 'На складе нет ткани',
      rollOption: (name, color, rem) => `${name} (${color}) — ${rem} кг в наличии`,
      kgUsedLabel: 'Расход (кг) *',
      cutPiecesLabel: 'Выход (шт) *',
      remainingAfter: 'Останется ткани:',
      noteLabel: 'Примечание (размеры и т.д.)',
      notePlaceholder: 'Например: S–XL, по 25 шт каждого размера',
      submitBtn: 'Завершить крой и получить QR',
      listTitle: 'Партии раскроя (QR на крой)',
      listSub: 'Распечатайте QR-код, приклейте к крою и передайте в швейный цех',
      goSewing: 'В цех Асель эже',
      colModel: 'Модель',
      colFabric: 'Ткань',
      colKgUsed: 'Расход (кг)',
      colCutPieces: 'Выход (шт)',
      colStage: 'Этап',
      colQr: 'QR кроя',
      emptyList: 'Партий раскроя пока нет.',
      qrBtn: 'QR наклейка',
      statuses: {
        cutting: 'В раскрое',
        sewing: 'У Асель эже (пошив)',
        ironing: 'Утюжка / Упаковка (Изат)',
        awaiting_zavsklad: 'Ожидает завсклада',
        stocked: 'Принято на склад',
      },
    },
    sewing: {
      allTab: (n) => `Все (${n})`,
      addTaskBtn: 'Задание швее',
      goPackingBtn: 'Утюжка и упаковка (Изат)',
      modelLabel: 'Модель *',
      seamstressLabel: 'Швея',
      machineLabel: 'Машина',
      piecesLabel: 'Кол-во (шт) *',
      colorPlaceholder: 'Цвет',
      listTitle: 'Асель эже — швейный цех (4 швеи)',
      listSub: 'Укажите количество пошитых изделий (прямострочка, распошивалка, оверлок) и передайте Изат',
      colModel: 'Модель',
      colSeamstress: 'Швея · Машина',
      colAssigned: 'Выдано',
      colSewn: 'Пошито',
      colDefect: 'Брак',
      colAction: 'Действие',
      emptyList: 'По выбранной швее нет активных партий.',
      sentToPacking: 'Передано Изат',
      editCountBtn: 'Ввести кол-во',
      sendToPackingBtn: 'Передать Изат',
      machines: {
        'Түз тигүү': 'Прямострочка',
        Распошивалка: 'Распошивалка',
        Оверлок: 'Оверлок',
      },
    },
    packing: {
      headerTitle: 'Утюжка, упаковка, Изат — Пересчёт и сдача на склад',
      headerSub: 'Пересчитайте упакованный товар и нажмите «Передать завскладу»',
      manualAddBtn: 'Добавить вручную',
      goZavskladBtn: 'К завскладу',
      modelLabel: 'Название модели *',
      colorLabel: 'Цвет',
      piecesLabel: 'Кол-во (шт) *',
      colModel: 'Модель',
      colResponsible: 'Ответственный',
      colIncoming: 'С пошива пришло',
      colPacked: 'Упаковано (шт)',
      colStatus: 'Статус',
      colAction: 'Действие',
      emptyList: 'На утюжке и упаковке пока нет партий.',
      statusAccepted: 'Принято завскладом',
      statusAwaiting: 'Передано завскладу (ожидает)',
      statusPacking: 'Утюжка и пересчёт',
      editCountBtn: 'Уточнить кол-во',
      handOverBtn: 'Передать завскладу',
      handedOverText: 'Передано',
    },
    zavsklad: {
      incomingTitle: (n) => `Готовый товар от Изат (ожидает приёма: ${n})`,
      incomingSub: 'Пересчитайте, подпишите название и наклейте штрих-код через кнопку «Принять»',
      countedByIzat: 'Изат насчитала',
      acceptQrBtn: 'Принять и штрих-код',
      formTitleAccept: 'Приём пришедшего товара',
      formTitleDirect: 'Прямой приход на склад',
      formSub: 'Считает, подписывает, клеит штрих-код',
      errNameCode: 'Укажите название товара и код модели.',
      errQty: 'Укажите корректное количество (шт).',
      templateLabel: 'Выбрать из моделей (с фото)',
      templateManual: 'Ввести вручную',
      nameLabel: 'Название товара *',
      namePlaceholder: 'Например: Оверсайз футболка',
      codeLabel: 'Код модели *',
      colorLabel: 'Цвет',
      sizeLabel: 'Размеры',
      qtyLabel: 'Принято (шт) *',
      barcodeLabel: 'Штрих-код',
      regenBarcode: 'Создать новый',
      submitAccept: 'Принять на склад',
      submitDirect: 'Добавить на склад',
      listTitle: 'Завсклад — Остатки товаров',
      summary: (t, m) => `Общий остаток: ${t} шт · ${m} модел.`,
      searchPlaceholder: 'Название или штрих-код...',
      goDispatchBtn: 'К отправке клиенту',
      colProduct: 'Товар / Модель',
      colBarcode: 'Штрих-код',
      colReceived: 'Приход',
      colShipped: 'Расход',
      colRemaining: 'Остаток',
      colAction: 'Действие',
      emptyList: 'Товары не найдены.',
      restockBtn: '+ Приход',
      dispatchBtn: 'Отправка',
      barcodeModalTitle: 'Этикетка со штрих-кодом',
      barcodeMeta: (color, size) => `Цвет: ${color} · Размер: ${size}`,
      downloadPng: 'Скачать PNG',
      printBtn: 'Распечатать',
      deleteTitle: 'Удалить товар',
      deleteMsg: (name, code) => `Удалить товар «${name} (${code})» со склада?`,
    },
    dispatch: {
      formTitle: 'Отправка клиенту',
      formSub: 'Ушедший товар вычитается, остаток считается автоматически',
      errSelect: 'Выберите товар со склада.',
      errClient: 'Укажите имя клиента.',
      errQty: 'Укажите корректное количество (шт).',
      errInsufficient: (rem, req) => `На складе только ${rem} шт. Нельзя отправить ${req} шт.`,
      errNotFound: 'Товар не найден.',
      successMsg: (client, qty, name) =>
        `Клиенту ${client} отправлено ${qty} шт «${name}». Остаток пересчитан.`,
      productLabel: 'Выберите товар (название или штрих-код) *',
      noProductOption: 'Нет товара на складе',
      productOption: (name, code, barcode, rem) =>
        `${name} (${code}) · ${barcode} — ${rem} шт в наличии`,
      clientLabel: 'Имя клиента *',
      clientPlaceholder: 'Например: Айгуль эже',
      containerLabel: 'Ряд на Дордое / Контейнер / Карго',
      containerPlaceholder: 'Например: 7-проход, 24-контейнер',
      qtyLabel: 'Количество отправки (шт) *',
      previewCurrent: 'Было на складе:',
      previewMinus: 'Отправляется (минус):',
      previewBalance: 'Новый остаток:',
      noteLabel: 'Примечание (мешок, накладная)',
      notePlaceholder: 'Например: 1 мешок, полная линейка',
      submitBtn: 'Оформить отправку (Минус со склада)',
      listTitle: 'Журнал отправок',
      listSub: 'История всех отгрузок и остаток на момент отправки',
      searchPlaceholder: 'Клиент или товар...',
      exportCsv: 'Скачать CSV',
      colClient: 'Клиент · Контейнер',
      colProduct: 'Товар · Штрих-код',
      colShipped: 'Ушло',
      colBalanceAfter: 'Остаток после',
      colDate: 'Дата',
      colRevert: 'Возврат',
      emptyList: 'История отправок пуста.',
      revertBtn: 'Вернуть',
      revertTitle: 'Отменить отправку',
      revertMsg: (client, qty, name) =>
        `Вернуть на склад ${qty} шт «${name}», отправленных клиенту ${client}?`,
      revertConfirmBtn: 'Вернуть на склад',
      csvHeaders: [
        'Дата',
        'Клиент',
        'Контейнер/Адрес',
        'Товар',
        'Модель',
        'Штрих-код',
        'Отправлено (шт)',
        'Остаток (шт)',
        'Примечание',
      ],
    },
    qrModal: {
      titleBatch: 'QR-наклейка на крой',
      titleModel: 'QR-код модели',
      subtitle: 'При сканировании с телефона откроется фото и описание модели',
      generating: 'Генерация QR...',
      batchInfo: (pieces, id) => `Партия кроя: ${pieces} шт · ${id}`,
      stickerHint: 'Сканируйте QR с телефона, чтобы увидеть фото',
      copyLink: 'Ссылка',
      copied: 'Скопировано',
      previewMobile: 'Вид с телефона',
      downloadPng: 'Скачать PNG',
      printBtn: 'Распечатать',
    },
    qrViewer: {
      notFoundTitle: 'Модель не найдена',
      notFoundMsg: 'Модель по этому QR-коду удалена или ссылка неверна.',
      goSiteBtn: 'Перейти на сайт склада',
      backBtn: 'На главную',
      badge: 'QR Карта модели',
      noPhoto: 'Фото не добавлено',
      modelPrefix: 'Модель',
      fabricLabel: 'Ткань',
      stockLabel: 'Остаток на складе',
      notesTitle: 'Инструкция по пошиву / крою',
      noNotes: 'Дополнительные примечания не указаны.',
      batchTitle: 'Партия раскроя',
      cutInfo: (pieces, kg) => `Выкроено: ${pieces} шт · ${kg} кг ткани`,
      statusLabel: 'Статус',
      recentBatches: 'Последние партии кроя',
    },
    auth: {
      setupTitle: 'Создать пароль администратора',
      setupSub: 'Задайте пароль при первом входе — он защитит админ-панель и QR-подключение сотрудников',
      loginTitle: 'Вход администратора',
      loginSub: 'Введите пароль для управления складом и подключения сотрудников по QR-коду',
      passcodeLabel: 'Пароль администратора (ПИН)',
      passcodePlaceholder: 'Введите пароль',
      setupPasscodePlaceholder: 'Минимум 4 символа (напр. 1234)',
      confirmLabel: 'Повторите пароль',
      confirmPlaceholder: 'Введите пароль ещё раз',
      setupBtn: 'Сохранить и войти',
      loginBtn: 'Войти как админ',
      errShort: 'Пароль должен содержать минимум 4 символа.',
      errMismatch: 'Пароли не совпадают.',
      errInvalid: 'Неверный пароль. Попробуйте снова.',
      errNetwork: 'Ошибка соединения с сервером. Повторите попытку.',
      employeeHintTitle: 'Вы сотрудник?',
      employeeHintDesc: 'Сотрудникам пароль не нужен — просто отсканируйте QR-код с экрана администратора, и откроется ваш раздел.',
      connectingTitle: 'Подключение по QR-коду...',
      connectingSub: 'Проверяем ваш доступ и загружаем раздел',
      revokedTitle: 'Доступ отключён',
      revokedSub: 'Администратор отключил ваш доступ или обновил QR-код. Обратитесь к админу для повторного подключения.',
      invalidQrTitle: 'QR-код недействителен',
      invalidQrSub: 'Эта ссылка устарела или сотрудник удалён. Попросите администратора открыть новый QR-код.',
      disabledQrTitle: 'Доступ сотрудника выключен',
      disabledQrSub: 'Администратор временно отключил этого сотрудника.',
      returnHomeBtn: 'На главный экран',
    },
    staff: {
      formTitle: 'Добавить сотрудника (QR-доступ)',
      formSub: 'Создайте сотрудника и выберите его участок — каждый видит только свой раздел',
      errName: 'Введите имя сотрудника.',
      errGeneric: 'Не удалось сохранить. Попробуйте снова.',
      nameLabel: 'Имя сотрудника *',
      namePlaceholder: 'Например: Бакыт / Гульзат',
      stageLabel: 'К какому разделу дать доступ? *',
      seamstressFilterLabel: 'Фильтр швеи (необязательно)',
      seamstressAllOption: 'Все 4 швеи (цех Асель эже)',
      noteLabel: 'Должность / Примечание',
      notePlaceholder: 'Например: Закройщик, 2-я смена',
      submitBtn: 'Добавить сотрудника и открыть QR',
      listTitle: 'Сотрудники и QR-подключения',
      listSummary: (total, connected, disabled) =>
        `Всего: ${total} · Подключены: ${connected} · Отключены: ${disabled}`,
      refreshBtn: 'Обновить',
      colEmployee: 'Сотрудник',
      colDepartment: 'Доступный раздел',
      colStatus: 'Статус',
      colActions: 'Действия',
      emptyList: 'Сотрудников пока нет. Добавьте первого сотрудника слева.',
      statusConnected: 'Подключён',
      statusWaiting: 'Ждёт QR',
      statusDisabled: 'Отключён',
      lastActivePrefix: 'Активность',
      openQrBtn: 'Открыть QR',
      disableBtn: 'Отключить',
      enableBtn: 'Включить',
      testViewBtn: 'Открыть',
      deleteTitle: 'Удалить сотрудника',
      deleteMsg: (name) =>
        `Удалить сотрудника «${name}»? Его телефон будет немедленно отключён от системы.`,
      qrModalTitle: 'QR-код подключения сотрудника',
      qrModalSub: 'Администратор открывает этот QR — сотрудник сканирует его телефоном',
      qrScanInstruction: 'Сотрудник сканирует камерой телефона — откроется только его рабочий раздел',
      qrRegenerateBtn: 'Новый QR',
      qrRegenerateConfirmTitle: 'Обновить QR-код',
      qrRegenerateConfirmMsg: (name) =>
        `Для «${name}» будет создан новый QR-код, а старое устройство сразу отключится. Продолжить?`,
      qrRegenerateConfirmBtn: 'Обновить QR',
      qrPreviewAsStaffBtn: 'Открыть как сотрудник',
      onlyOwnSectionHint: 'Вам доступен только этот раздел',
      stageLabels: {
        fabric: '1. Склад ткани',
        cutting: '2. Раскрой (QR на крой)',
        sewing: '3. Асель эже (Пошив)',
        packing: '4. Утюжка, Изат',
        zavsklad: '5. Завсклад',
        dispatch: '6. Отправка клиенту',
      },
    },
  },
};
