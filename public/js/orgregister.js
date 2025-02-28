"use strict";

    let registrationOrgCheckbox = document.querySelector('#registration_org');                  // инпут: "Я действую от имени юридического лица"
    let registrationOrgBlock = document.querySelector('#registration_org_block');               // див, куда мы будем записывать поля для регистрации юридического лица
    let regOrgBlockContractInfoDiv = document.querySelector('#registration_org_block_contract'); 
    regOrgBlockContractInfoDiv.style.display = 'none';


    // здесь мы будем собирать возможные ошибки при заполнении полей формы для регистрации юридического лица:
    let inphiddenwitherrorinfo = document.querySelector('#inphiddenwitherrorinfo');
    console.log(inphiddenwitherrorinfo);

    registrationOrgCheckbox.addEventListener('click', event => {
        console.log(event.target);
        registrationOrgCheckbox.hasAttribute('checked') ? registrationOrgCheckbox.removeAttribute('checked') :  registrationOrgCheckbox.setAttribute('checked', true);
        console.log(registrationOrgCheckbox.hasAttribute('checked'));
        getRegOrgBlockDiv();
    });

    console.log(registrationOrgCheckbox.hasAttribute('checked'));
    getRegOrgBlockDiv();

    function getRegOrgBlockDiv() {
        if (registrationOrgCheckbox.hasAttribute('checked')) {
            let registrationOrgBlock = document.querySelector('#registration_org_block');
            registrationOrgBlock.style.display = 'block';

            regOrgBlockContractInfoDiv.style.display = 'none'; // делаем скрытым блок полей для ввода информации для заполнения контракта
                      
            let nameOrgPelem = document.createElement('p');
            nameOrgPelem.className = 'registration-form__input-item';
                let lableNameOrg = document.createElement('label');
                lableNameOrg.setAttribute('for', 'registration-name-org');
                lableNameOrg.className = 'label';
                lableNameOrg.textContent = 'Наименование организации: ';
                nameOrgPelem.appendChild(lableNameOrg);

                let inputNameOrg = document.createElement('input');
                inputNameOrg.className = 'registration-form__input';
                inputNameOrg.setAttribute('id', 'registration-name-org');
                inputNameOrg.setAttribute('type', 'text');
                inputNameOrg.setAttribute('required', true);
                inputNameOrg.dataset.rule = 'nameorgfieldtext';
                inputNameOrg.dataset.maxlength = '255';
                inputNameOrg.setAttribute('name', 'name_of_org');
                
                // при отправке POST желательно сохранять введённое в поле значение... пробуем это реализовать через sessionStarage:
                let regOrnNameValue = sessionStorage.getItem('regOrnNameValueInSessionStorage');
                if (regOrnNameValue === null) {
                    regOrnNameValue = '';
                }
                inputNameOrg.setAttribute('value', regOrnNameValue);  
                inputNameOrg.addEventListener('change', () => {
                    sessionStorage.setItem('regOrnNameValueInSessionStorage', inputNameOrg.value);

                });

                nameOrgPelem.appendChild(inputNameOrg);

                let spanElemForStarMandatoryField = document.createElement('span');
                spanElemForStarMandatoryField.className = 'registration-error';
                let spanElemForStarMandatoryFieldTextContent = '';
                if (inphiddenwitherrorinfo.dataset.nameoforgerr != '') {
                    spanElemForStarMandatoryFieldTextContent = inphiddenwitherrorinfo.dataset.nameoforgerr + '<br>';
                }
                spanElemForStarMandatoryField.innerHTML = ' *<br>' + spanElemForStarMandatoryFieldTextContent;
                nameOrgPelem.appendChild(spanElemForStarMandatoryField);

                let spanElemForClearOrrdNameField = document.createElement('span');
                spanElemForClearOrrdNameField.className = 'productAddition-form__clearance';
                spanElemForClearOrrdNameField.textContent = 'Наименование организации указывается в соответствии с учредительными документами';
                nameOrgPelem.appendChild(spanElemForClearOrrdNameField);

                let spanElemForErrordNameField = document.createElement('span');
                spanElemForErrordNameField.className = 'registration-error';
                spanElemForErrordNameField.setAttribute('id', 'registrationerrornameorg');
                nameOrgPelem.appendChild(spanElemForErrordNameField);
            registrationOrgBlock.appendChild(nameOrgPelem);

            let innOrgPelemMain = document.createElement('p');
            innOrgPelemMain.className = 'registration-form__input-item';
                let lableINNOrg = document.createElement('label');
                lableINNOrg.className = 'label';
                lableINNOrg.setAttribute('for', 'registration-org-inn')
                lableINNOrg.textContent = 'ИНН: ';
                innOrgPelemMain.appendChild(lableINNOrg);

                let inputINNOrg = document.createElement('input');
                inputINNOrg.className = 'registration-form__input';
                inputINNOrg.setAttribute('id', 'registration-org-inn');
                inputINNOrg.setAttribute('type', 'text');
                inputINNOrg.setAttribute('required', true);
                inputINNOrg.dataset.rule = 'orgfieldinn';
                inputINNOrg.dataset.minlength = '10';
                inputINNOrg.dataset.maxlength = '12';
                inputINNOrg.setAttribute('name', 'org_inn');
                
                // при отправке POST желательно сохранять введённое в поле значение... пробуем это реализовать через sessionStarage:
                let regOrgINNValue = sessionStorage.getItem('regOrnInnValueInSessionStorage');
                if (regOrgINNValue === null) {
                    regOrgINNValue = '';
                }
                
                inputINNOrg.addEventListener('change', () => {
                    sessionStorage.setItem('regOrnInnValueInSessionStorage', inputINNOrg.value);

                });
                // console.log(regOrgINNValue);
                inputINNOrg.setAttribute('value', regOrgINNValue);  
                //console.log(inputINNOrg);
                innOrgPelemMain.appendChild(inputINNOrg);

                let spanElemForStarMandatoryFieldInn = document.createElement('span');
                spanElemForStarMandatoryFieldInn.className = 'registration-error';

                let spanElemForStarMandatoryFieldInnTextContent = '';
                if (inphiddenwitherrorinfo.dataset.innoforgerr != '') {
                    spanElemForStarMandatoryFieldInnTextContent = inphiddenwitherrorinfo.dataset.innoforgerr + '<br>';
                }
                spanElemForStarMandatoryFieldInn.innerHTML = ' *<br>' + spanElemForStarMandatoryFieldInnTextContent;
                innOrgPelemMain.appendChild(spanElemForStarMandatoryFieldInn);

                let spanElemForErrordINNField = document.createElement('span');
                spanElemForErrordINNField.className = 'registration-error';
                spanElemForErrordINNField.setAttribute('id', 'registrationerrorinnorg');
                innOrgPelemMain.appendChild(spanElemForErrordINNField);
            registrationOrgBlock.appendChild(innOrgPelemMain);

            // -- kpp start
            let kppOrgPelemMain = document.createElement('p');
            kppOrgPelemMain.className = 'registration-form__input-item';
                let lableKPPOrg = document.createElement('label');
                lableKPPOrg.className = 'label';
                lableKPPOrg.setAttribute('for', 'registration-org-kpp')
                lableKPPOrg.textContent = 'КПП: ';
                kppOrgPelemMain.appendChild(lableKPPOrg);

                let inputKPPOrg = document.createElement('input');
                inputKPPOrg.className = 'registration-form__input';
                inputKPPOrg.setAttribute('id', 'registration-org-kpp');
                inputKPPOrg.setAttribute('type', 'text');
                inputKPPOrg.setAttribute('required', true);
                inputKPPOrg.dataset.rule = 'orgfieldkpp';
                // inputKPPOrg.dataset.minlength = '10';
                // inputKPPOrg.dataset.maxlength = '12';
                inputKPPOrg.setAttribute('name', 'org_kpp');
                
                // при отправке POST желательно сохранять введённое в поле значение... пробуем это реализовать через sessionStarage:
                let regOrgKPPValue = sessionStorage.getItem('regOrnKppValueInSessionStorage');
                if (regOrgKPPValue === null) {
                    regOrgKPPValue = '';
                }
                
                inputKPPOrg.addEventListener('change', () => {
                    sessionStorage.setItem('regOrnKppValueInSessionStorage', inputKPPOrg.value);

                });
                // console.log(regOrgKPPValue);
                inputKPPOrg.setAttribute('value', regOrgKPPValue);  
                //console.log(inputKPPOrg);
                kppOrgPelemMain.appendChild(inputKPPOrg);

                let spanElemForStarMandatoryFieldKpp = document.createElement('span');
                spanElemForStarMandatoryFieldKpp.className = 'registration-error';

                let spanElemForStarMandatoryFieldKppTextContent = '';
                if (inphiddenwitherrorinfo.dataset.kppoforgerr != '') {
                    spanElemForStarMandatoryFieldKppTextContent = inphiddenwitherrorinfo.dataset.kppoforgerr + '<br>';
                }
                spanElemForStarMandatoryFieldKpp.innerHTML = ' *<br>' + spanElemForStarMandatoryFieldKppTextContent;
                kppOrgPelemMain.appendChild(spanElemForStarMandatoryFieldKpp);

                let spanElemForErrordKPPField = document.createElement('span');
                spanElemForErrordKPPField.className = 'registration-error';
                spanElemForErrordKPPField.setAttribute('id', 'registrationerrorkpporg');
                kppOrgPelemMain.appendChild(spanElemForErrordKPPField);
            registrationOrgBlock.appendChild(kppOrgPelemMain);
            // - kpp finish

            let addrOrgDivMain = document.createElement('div');
            addrOrgDivMain.className = 'registration-form__input-item';
                let lableAdrrOrg = document.createElement('label');
                lableAdrrOrg.className = 'label';
                lableAdrrOrg.setAttribute('for', 'org_addr')
                lableAdrrOrg.textContent = 'Юридический адрес организации: ';
                addrOrgDivMain.appendChild(lableAdrrOrg);

                let addrOrgDiv2 = document.createElement('div');
                addrOrgDiv2.className = 'registration-form__input-address-org';
                addrOrgDiv2.setAttribute('id', 'org_addr');
                addrOrgDiv2.setAttribute('contenteditable', true);
                addrOrgDiv2.dataset.checkorgaddr = 'orgaddressfieldtext';
                let addrOrgDiv2Content = sessionStorage.getItem('regOrnAddrContentInSessionStorage');
                if (addrOrgDiv2Content === null) {
                    addrOrgDiv2Content = '';
                }
                addrOrgDiv2.textContent = addrOrgDiv2Content;  
                addrOrgDiv2.addEventListener('blur', () => {
                    sessionStorage.setItem('regOrnAddrContentInSessionStorage', addrOrgDiv2.textContent);

                });
                addrOrgDivMain.appendChild(addrOrgDiv2);

                let spanElemForStarMandatoryFieldOrgAddr = document.createElement('span');
                spanElemForStarMandatoryFieldOrgAddr.className = 'registration-error';
                let spanElemForStarMandatoryFieldOrgAddrTextContent = '';
                if (inphiddenwitherrorinfo.dataset.addroforgerr != '') {
                    spanElemForStarMandatoryFieldOrgAddrTextContent = inphiddenwitherrorinfo.dataset.addroforgerr + '<br>';
                }
                spanElemForStarMandatoryFieldOrgAddr.innerHTML = '&nbsp*<br>' + spanElemForStarMandatoryFieldOrgAddrTextContent;
                addrOrgDivMain.appendChild(spanElemForStarMandatoryFieldOrgAddr);

                let spanElemForClearFieldOrgAdrr = document.createElement('span');
                spanElemForClearFieldOrgAdrr.className = 'productAddition-form__clearance';
                spanElemForClearFieldOrgAdrr.innerHTML = 'Юридический адрес указывается в соответствии с учредительными документами.<br>';
                addrOrgDivMain.appendChild(spanElemForClearFieldOrgAdrr);
                
                let spanElemForStarMandatoryFieldAdrr = document.createElement('span');
                spanElemForStarMandatoryFieldAdrr.className = 'registration-error';
                spanElemForStarMandatoryFieldAdrr.setAttribute('id', 'registrationerrororgaddr');
                addrOrgDivMain.appendChild(spanElemForStarMandatoryFieldAdrr);

            registrationOrgBlock.appendChild(addrOrgDivMain);

            let inputAdrrOrg = document.createElement('input');
                inputAdrrOrg.setAttribute('id', 'hiddenInputRegistrationOrgAddress');
                inputAdrrOrg.setAttribute('type', 'hidden');
                inputAdrrOrg.setAttribute('name', 'org_addr');
                inputAdrrOrg.setAttribute('value', addrOrgDiv2Content);
            registrationOrgBlock.appendChild(inputAdrrOrg);

            let regOrgTelNumPelemMain = document.createElement('p');
            regOrgTelNumPelemMain.className = 'registration-form__input-item';
                let lableTelNumOrgReg = document.createElement('label');
                lableTelNumOrgReg.className = 'label';
                lableTelNumOrgReg.setAttribute('for', 'registrationorgtelnum')
                lableTelNumOrgReg.textContent = 'Номер телефона организации: ';
                regOrgTelNumPelemMain.appendChild(lableTelNumOrgReg);

                let inputTelNumOrgReg = document.createElement('input');
                inputTelNumOrgReg.className = 'registration-form__input';
                inputTelNumOrgReg.setAttribute('id', 'registrationorgtelnum');
                inputTelNumOrgReg.setAttribute('type', 'tel');
                inputTelNumOrgReg.setAttribute('name', 'regorgtel');
                inputTelNumOrgReg.setAttribute('required', true);
                inputTelNumOrgReg.setAttribute('placeholder', '+7 (999) 123-45-67');
                inputTelNumOrgReg.setAttribute('pattern', "(\\+7)\\s[\\(][0-9]{3}[\\)]\\s[0-9]{3}-[0-9]{2}-[0-9]{2}");
                // при отправке POST желательно сохранять введённое в поле значение... пробуем это реализовать через sessionStarage:
                let regOrgTelNumValue = sessionStorage.getItem('regOrnTelNumValueInSessionStorage');
                if (regOrgTelNumValue === null) {
                    regOrgTelNumValue = '';
                }
                inputTelNumOrgReg.setAttribute('value', regOrgTelNumValue);  
                inputTelNumOrgReg.addEventListener('change', () => {
                    sessionStorage.setItem('regOrnTelNumValueInSessionStorage', inputTelNumOrgReg.value);
                });
                regOrgTelNumPelemMain.appendChild(inputTelNumOrgReg);

                let spanElemForStarMandatoryFieldOrgTelNum = document.createElement('span');
                spanElemForStarMandatoryFieldOrgTelNum.className = 'registration-error';
                let spanElemForStarMandatoryFieldOrgTelNumTextContent = '';
                if (inphiddenwitherrorinfo.dataset.telnumoforgerr != '') {
                    spanElemForStarMandatoryFieldOrgTelNumTextContent = inphiddenwitherrorinfo.dataset.telnumoforgerr + '<br>';
                }
                spanElemForStarMandatoryFieldOrgTelNum.innerHTML = ' *<br>' + spanElemForStarMandatoryFieldOrgTelNumTextContent;
                regOrgTelNumPelemMain.appendChild(spanElemForStarMandatoryFieldOrgTelNum);

                let spanElemForClearOrrdNameFieldOrgTelNum = document.createElement('span');
                spanElemForClearOrrdNameFieldOrgTelNum.className = 'productAddition-form__clearance';
                spanElemForClearOrrdNameFieldOrgTelNum.innerHTML = 'Номер телефона вводится в формате: +7 (999) 123-45-67<br>';
                regOrgTelNumPelemMain.appendChild(spanElemForClearOrrdNameFieldOrgTelNum);

                let spanElemForMandatoryFieldErrorTelNum = document.createElement('span');
                spanElemForMandatoryFieldErrorTelNum.setAttribute('id', 'registrationerrororgtelnum');
                spanElemForMandatoryFieldErrorTelNum.className = 'registration-error';
                regOrgTelNumPelemMain.appendChild(spanElemForMandatoryFieldErrorTelNum);
            registrationOrgBlock.appendChild(regOrgTelNumPelemMain);

            let regOrgEmailPelemMain = document.createElement('p');
            regOrgEmailPelemMain.className = 'registration-form__input-item';
                let lableEmailOrgReg = document.createElement('label');
                lableEmailOrgReg.className = 'label';
                lableEmailOrgReg.setAttribute('for', 'regorgemail')
                lableEmailOrgReg.textContent = 'Email организации: ';
                regOrgEmailPelemMain.appendChild(lableEmailOrgReg);

                let inputEmailOrgReg = document.createElement('input');
                inputEmailOrgReg.className = 'registration-form__input';
                inputEmailOrgReg.setAttribute('id', 'regorgemail');
                inputEmailOrgReg.setAttribute('type', 'email');
                inputEmailOrgReg.setAttribute('name', 'regorgemail');
                inputEmailOrgReg.setAttribute('autofocus', true);
                inputEmailOrgReg.setAttribute('autocomplete', 'username');
                inputEmailOrgReg.setAttribute('required', true);
                inputEmailOrgReg.setAttribute('placeholder', 'organization@yandex.com');
                
                // при отправке POST желательно сохранять введённое в поле значение... пробуем это реализовать через sessionStarage:
                let regOrgEmailValue = sessionStorage.getItem('regOrnEmailValueInSessionStorage');
                if (regOrgEmailValue === null) {
                    regOrgEmailValue = '';
                }
                inputEmailOrgReg.setAttribute('value', regOrgEmailValue);  
                inputEmailOrgReg.addEventListener('change', () => {
                    sessionStorage.setItem('regOrnEmailValueInSessionStorage', inputEmailOrgReg.value);
                });
                regOrgEmailPelemMain.appendChild(inputEmailOrgReg);

                let spanElemForStarMandatoryFieldOrgEmail = document.createElement('span');
                spanElemForStarMandatoryFieldOrgEmail.className = 'registration-error';
                let spanElemForStarMandatoryFieldOrgEmailTextContent = '';
                if (inphiddenwitherrorinfo.dataset.emailoforgerr != '') {
                    spanElemForStarMandatoryFieldOrgEmailTextContent = inphiddenwitherrorinfo.dataset.emailoforgerr + '<br>';
                }
                spanElemForStarMandatoryFieldOrgEmail.innerHTML = ' *<br>' + spanElemForStarMandatoryFieldOrgEmailTextContent;
                regOrgEmailPelemMain.appendChild(spanElemForStarMandatoryFieldOrgEmail);

                let spanElemForClearOrrdNameFieldOrgEmail = document.createElement('span');
                spanElemForClearOrrdNameFieldOrgEmail.className = 'productAddition-form__clearance';
                spanElemForClearOrrdNameFieldOrgEmail.innerHTML = 'Если регистрируется организация - именно этот адрес будет использоваться в качестве логина для авторизации пользователя.<br>';
                regOrgEmailPelemMain.appendChild(spanElemForClearOrrdNameFieldOrgEmail);

                let spanElemForMandatoryFieldErrorEmail = document.createElement('span');
                spanElemForMandatoryFieldErrorEmail.setAttribute('id', 'registrationerrororgemail');
                spanElemForMandatoryFieldErrorEmail.className = 'registration-error';
                regOrgEmailPelemMain.appendChild(spanElemForMandatoryFieldErrorEmail);
            registrationOrgBlock.appendChild(regOrgEmailPelemMain);

            let regOrgIsVatPayerDivMain = document.createElement('div');
            regOrgIsVatPayerDivMain.className = 'registration-form__input-item d-flex flex-sb';
            regOrgIsVatPayerDivMain.setAttribute('id', 'registration_org_checkbox_vat_payer');

                let regOrgIsVatPayerLabel = document.createElement('lable');
                regOrgIsVatPayerLabel.setAttribute('for', 'registration_org_vat_payer');
                regOrgIsVatPayerLabel.innerHTML = 'Организация - плательщик НДС';
                regOrgIsVatPayerDivMain.appendChild(regOrgIsVatPayerLabel);

                let regOrgIsVatPayerInputCheckBox = document.createElement('input');
                regOrgIsVatPayerInputCheckBox.setAttribute('type', 'checkbox');
                regOrgIsVatPayerInputCheckBox.setAttribute('id', 'registration_org_vat_payer');
                regOrgIsVatPayerInputCheckBox.setAttribute('name', 'orgvatpayer');
                regOrgIsVatPayerInputCheckBox.setAttribute('value', '1');
                
                let regOrgIsVatPayerValue = sessionStorage.getItem('regOrgIsVatPayerInSessionStorage');
                if (regOrgIsVatPayerValue === null) {
                    regOrgIsVatPayerInputCheckBox.hasAttribute('checked') ? regOrgIsVatPayerInputCheckBox.removeAttribute('checked') : true;
                } else {
                    regOrgIsVatPayerInputCheckBox.hasAttribute('checked') ? true : regOrgIsVatPayerInputCheckBox.setAttribute('checked', true);
                }
                
                regOrgIsVatPayerInputCheckBox.addEventListener('click', () => {
                    regOrgIsVatPayerInputCheckBox.hasAttribute('checked') ? regOrgIsVatPayerInputCheckBox.removeAttribute('checked') :  regOrgIsVatPayerInputCheckBox.setAttribute('checked', true);
                    regOrgIsVatPayerInputCheckBox.hasAttribute('checked') ? sessionStorage.setItem('regOrgIsVatPayerInSessionStorage', true) : sessionStorage.removeItem('regOrgIsVatPayerInSessionStorage');
                });
                regOrgIsVatPayerDivMain.appendChild(regOrgIsVatPayerInputCheckBox);
            registrationOrgBlock.appendChild(regOrgIsVatPayerDivMain);
/* 10.01.2025 подумал, что оформление договора лучше вынести из процесса регистрации (не до этого сейчас юзеру) и вывести этот процесс в личный кабинет, когда он будет оформлять свой заказ...
            let regOrgNeedsContractDivMain = document.createElement('div');
            regOrgNeedsContractDivMain.className = 'registration-form__input-item d-flex flex-sb';
            regOrgNeedsContractDivMain.setAttribute('id', 'registration_org_checkbox_regular_contract');
            
                let regOrgNeedsContractLabel = document.createElement('lable');
                regOrgNeedsContractLabel.setAttribute('for', 'registration_org_regular_contract');
                regOrgNeedsContractLabel.innerHTML = 'Для закупок необходим договор';
                regOrgNeedsContractDivMain.appendChild(regOrgNeedsContractLabel);

                let regOrgNeedsContractInputCheckBox = document.createElement('input');
                regOrgNeedsContractInputCheckBox.setAttribute('type', 'checkbox');
                regOrgNeedsContractInputCheckBox.setAttribute('id', 'registration_org_regular_contract');
                regOrgNeedsContractInputCheckBox.setAttribute('name', 'orgneedsregularcontract');
                regOrgNeedsContractInputCheckBox.setAttribute('value', 'yes');

                let regOrgNeedsContractRegularValue = sessionStorage.getItem('regOrNeedsContractRegularInSessionStorage');
                if (regOrgNeedsContractRegularValue === null) {
                    regOrgNeedsContractInputCheckBox.hasAttribute('checked') ? regOrgNeedsContractInputCheckBox.removeAttribute('checked') : true;
                    makeRegOrgContractInfoDiv(regOrgNeedsContractInputCheckBox.hasAttribute('checked'));
                } else {
                    regOrgNeedsContractInputCheckBox.hasAttribute('checked') ? true : regOrgNeedsContractInputCheckBox.setAttribute('checked', true);
                    makeRegOrgContractInfoDiv(regOrgNeedsContractInputCheckBox.hasAttribute('checked'));
                }
                                
                regOrgNeedsContractInputCheckBox.addEventListener('click', () => {
                    regOrgNeedsContractInputCheckBox.hasAttribute('checked') ? regOrgNeedsContractInputCheckBox.removeAttribute('checked') :  regOrgNeedsContractInputCheckBox.setAttribute('checked', true);
                    regOrgNeedsContractInputCheckBox.hasAttribute('checked') ? sessionStorage.setItem('regOrNeedsContractRegularInSessionStorage', true) : sessionStorage.removeItem('regOrNeedsContractRegularInSessionStorage');
                    makeRegOrgContractInfoDiv(regOrgNeedsContractInputCheckBox.hasAttribute('checked'));
                });
                regOrgNeedsContractDivMain.appendChild(regOrgNeedsContractInputCheckBox);

            registrationOrgBlock.appendChild(regOrgNeedsContractDivMain);
*/            
            // проверяем поля имени и фамилии, и адреса в том числе:
            checkInputedOrgAddressDiv('hiddenInputRegistrationOrgAddress');

            // делаем проверку вводимого ИНН организации:
            checkInputedFormFields('registration-org-inn', 'registrationerrorinnorg');

            // делаем проверку вводимого КПП организации:
            checkInputedFormFields('registration-org-kpp', 'registrationerrorkpporg');
            
            // делаем проверку вводимого номера мобильного телефона организации:
            checkInputedTelNum('registrationorgtelnum', 'registrationerrororgtelnum');
        

            function makeRegOrgContractInfoDiv(isChecked) {
/*
                let regOrgNeedsContractValue = sessionStorage.getItem('regOrgNeedsContractInSessionStorage');
                //console.log(regOrgNeedsContractValue);
                if (regOrgNeedsContractValue === null) {
                    regOrgNeedsContractInputCheckBox.hasAttribute('checked') ? regOrgNeedsContractInputCheckBox.removeAttribute('checked') :  regOrgNeedsContractInputCheckBox.setAttribute('checked', true);
                } else {
                    regOrgNeedsContractInputCheckBox.hasAttribute('checked') ? true : regOrgNeedsContractInputCheckBox.setAttribute('checked', true);
                }
*/
                if (isChecked) {
                    let regOrgBlockContractInfoDiv = document.querySelector('#registration_org_block_contract');
                    regOrgBlockContractInfoDiv.style.display = 'block';

                    sessionStorage.setItem('regOrgNeedsContractInSessionStorage', true);

                    let p1 = document.createElement('p');
                    p1.className = 'label';
                    p1.textContent = 'Договор от имени организации подпишет:';
                    regOrgBlockContractInfoDiv.appendChild(p1);
                    console.log(regOrgBlockContractInfoDiv);

                    let p2 = document.createElement('p');
                    p2.className = 'registration-form__input-item';
                        let label2 = document.createElement('label');
                        label2.className = 'label';
                        label2.setAttribute('for', 'registration-contract-surname');
                        label2.textContent = 'Фамилия подписанта договора: ';
                        p2.appendChild(label2);

                        let inputRegOrgRepresentSur = document.createElement('input');
                        inputRegOrgRepresentSur.setAttribute('id', 'registration-contract-surname');
                        inputRegOrgRepresentSur.setAttribute('required', true);
                        inputRegOrgRepresentSur.className = 'registration-form__input';
                        inputRegOrgRepresentSur.dataset.rule = 'namefieldtext';
                        inputRegOrgRepresentSur.dataset.maxlength = '30';
                        inputRegOrgRepresentSur.setAttribute('type', 'text');
                        inputRegOrgRepresentSur.setAttribute('name', 'contract_surname');
                        
                        let inputRegOrgRepresentSurValue = sessionStorage.getItem('regOrnRepSurnValueInSessionStorage');
                        if (inputRegOrgRepresentSurValue === null) {
                            inputRegOrgRepresentSurValue = '';
                        } 
                        inputRegOrgRepresentSur.setAttribute('value', inputRegOrgRepresentSurValue);

                        inputRegOrgRepresentSur.addEventListener('blur', () => {
                            sessionStorage.setItem('regOrnRepSurnValueInSessionStorage', inputRegOrgRepresentSur.value);
        
                        });
                        p2.appendChild(inputRegOrgRepresentSur);

                        let span2 = document.createElement('span');
                        span2.className = 'registration-error';
                        let span2_TextContent = '';
                        if (inphiddenwitherrorinfo.dataset.contractsurnameoforgerr != '') {
                            span2_TextContent = inphiddenwitherrorinfo.dataset.contractsurnameoforgerr + '<br>';
                        }
                        span2.innerHTML = ' *<br>' + span2_TextContent;
                        p2.appendChild(span2);

                        let span2_1 = document.createElement('span');
                        span2_1.className = 'productAddition-form__clearance';
                        span2_1.innerHTML = 'Заполняется буквами русского алфавита.<br>';
                        p2.appendChild(span2_1);

                        let span2_2 = document.createElement('span');
                        span2_2.setAttribute('id', 'registrationerrorcontractsurname');
                        span2_2.className = 'registration-error';
                        p2.appendChild(span2_2);
                    regOrgBlockContractInfoDiv.appendChild(p2);

                    let p3 = document.createElement('p');
                    p3.className = 'registration-form__input-item';
                        let label3 = document.createElement('label');
                        label3.className = 'label';
                        label3.setAttribute('for', 'registration-contract-name');
                        label3.textContent = 'Имя подписанта договора: ';
                        p3.appendChild(label3);

                        let inputRegOrgRepresentName = document.createElement('input');
                        inputRegOrgRepresentName.setAttribute('id', 'registration-contract-name');
                        inputRegOrgRepresentName.setAttribute('required', true);
                        inputRegOrgRepresentName.className = 'registration-form__input';
                        inputRegOrgRepresentName.dataset.rule = 'namefieldtext';
                        inputRegOrgRepresentName.dataset.maxlength = '30';
                        inputRegOrgRepresentName.setAttribute('type', 'text');
                        inputRegOrgRepresentName.setAttribute('name', 'contract_name');
                        
                        let inputRegOrgRepresentNameValue = sessionStorage.getItem('regOrnRepNameValueInSessionStorage');
                        if (inputRegOrgRepresentNameValue === null) {
                            inputRegOrgRepresentNameValue = '';
                        } 
                        inputRegOrgRepresentName.setAttribute('value', inputRegOrgRepresentNameValue);

                        inputRegOrgRepresentName.addEventListener('blur', () => {
                            sessionStorage.setItem('regOrnRepNameValueInSessionStorage', inputRegOrgRepresentName.value);
        
                        });
                        p3.appendChild(inputRegOrgRepresentName);

                        let span3 = document.createElement('span');
                        span3.className = 'registration-error';
                        let span3_TextContent = '';
                        if (inphiddenwitherrorinfo.dataset.contractnameoforgerr != '') {
                            span3_TextContent = inphiddenwitherrorinfo.dataset.contractnameoforgerr + '<br>';
                        }
                        span3.innerHTML = ' *<br>' + span3_TextContent;
                        p3.appendChild(span3);

                        let span3_1 = document.createElement('span');
                        span3_1.className = 'productAddition-form__clearance';
                        span3_1.innerHTML = '<br>';
                        p3.appendChild(span3_1);

                        let span3_2 = document.createElement('span');
                        span3_2.setAttribute('id', 'registrationerrorcontractname');
                        span3_2.className = 'registration-error';
                        p3.appendChild(span3_2);
                    regOrgBlockContractInfoDiv.appendChild(p3);

                    let p4 = document.createElement('p');
                    p4.className = 'registration-form__input-item';
                        let label4 = document.createElement('label');
                        label4.className = 'label';
                        label4.setAttribute('for', 'registration-contract-patronymic');
                        label4.textContent = 'Отчество подписанта договора: ';
                        p4.appendChild(label4);

                        let inputRegOrgRepresentPatronnymic = document.createElement('input');
                        inputRegOrgRepresentPatronnymic.setAttribute('id', 'registration-contract-patronymic');
                        inputRegOrgRepresentPatronnymic.setAttribute('required', true);
                        inputRegOrgRepresentPatronnymic.className = 'registration-form__input';
                        inputRegOrgRepresentPatronnymic.dataset.rule = 'namefieldtext';
                        inputRegOrgRepresentPatronnymic.dataset.maxlength = '30';
                        inputRegOrgRepresentPatronnymic.setAttribute('type', 'text');
                        inputRegOrgRepresentPatronnymic.setAttribute('name', 'contract_patronymic');
                        
                        let inputRegOrgRepresentPatronnymicValue = sessionStorage.getItem('regOrnRepPatronymicValueInSessionStorage');
                        if (inputRegOrgRepresentPatronnymicValue === null) {
                            inputRegOrgRepresentPatronnymicValue = '';
                        } 
                        inputRegOrgRepresentPatronnymic.setAttribute('value', inputRegOrgRepresentPatronnymicValue);

                        inputRegOrgRepresentPatronnymic.addEventListener('blur', () => {
                            sessionStorage.setItem('regOrnRepPatronymicValueInSessionStorage', inputRegOrgRepresentPatronnymic.value);
        
                        });
                        p4.appendChild(inputRegOrgRepresentPatronnymic);

                        let span4 = document.createElement('span');
                        span4.className = 'registration-error';
                        let span4_TextContent = '';
                        if (inphiddenwitherrorinfo.dataset.contractpatronoforgerr != '') {
                            span4_TextContent = inphiddenwitherrorinfo.dataset.contractpatronoforgerr + '<br>';
                        }
                        span4.innerHTML = ' *<br>' + span4_TextContent;
                        p4.appendChild(span4);

                        let span4_1 = document.createElement('span');
                        span4_1.className = 'productAddition-form__clearance';
                        span4_1.innerHTML = '<br>';
                        p4.appendChild(span4_1);

                        let span4_2 = document.createElement('span');
                        span4_2.setAttribute('id', 'registrationerrorcontractpatronymic');
                        span4_2.className = 'registration-error';
                        p4.appendChild(span4_2);
                    regOrgBlockContractInfoDiv.appendChild(p4);

                    let p5 = document.createElement('p');
                    p5.className = 'registration-form__input-item';
                        let label5 = document.createElement('label');
                        label5.className = 'label';
                        label5.setAttribute('for', 'registration-contract-position');
                        label5.textContent = 'Должность подписанта договора:  ';
                        p5.appendChild(label5);

                        let inputRegOrgRepresentPosition = document.createElement('input');
                        inputRegOrgRepresentPosition.setAttribute('id', 'registration-contract-position');
                        inputRegOrgRepresentPosition.setAttribute('required', true);
                        inputRegOrgRepresentPosition.className = 'registration-form__input';
                        inputRegOrgRepresentPosition.dataset.rule = 'namefieldtext';
                        inputRegOrgRepresentPosition.dataset.maxlength = '30';
                        inputRegOrgRepresentPosition.setAttribute('type', 'text');
                        inputRegOrgRepresentPosition.setAttribute('name', 'contract_position');
                        
                        let inputRegOrgRepresentPositionValue = sessionStorage.getItem('regOrnRepPositionInSessionStorage');
                        if (inputRegOrgRepresentPositionValue === null) {
                            inputRegOrgRepresentPositionValue = '';
                        } 
                        inputRegOrgRepresentPosition.setAttribute('value', inputRegOrgRepresentPositionValue);

                        inputRegOrgRepresentPosition.addEventListener('blur', () => {
                            sessionStorage.setItem('regOrnRepPositionInSessionStorage', inputRegOrgRepresentPosition.value);
        
                        });
                        p5.appendChild(inputRegOrgRepresentPosition);

                        let span5 = document.createElement('span');
                        span5.className = 'registration-error';
                        let span5_TextContent = '';
                        if (inphiddenwitherrorinfo.dataset.contractposoforgerr != '') {
                            span5_TextContent = inphiddenwitherrorinfo.dataset.contractposoforgerr + '<br>';
                        }
                        span5.innerHTML = ' *<br>' + span5_TextContent;
                        p5.appendChild(span5);

                        let span5_1 = document.createElement('span');
                        span5_1.className = 'productAddition-form__clearance';
                        span5_1.innerHTML = '<br>';
                        p5.appendChild(span5_1);

                        let span5_2 = document.createElement('span');
                        span5_2.setAttribute('id', 'registrationerrorcontractposition');
                        span5_2.className = 'registration-error';
                        p5.appendChild(span5_2);
                    regOrgBlockContractInfoDiv.appendChild(p5);

                    let p6 = document.createElement('p');
                    p6.className = 'registration-form__input-item';
                        let label6 = document.createElement('label');
                        label6.className = 'label';
                        label6.setAttribute('for', 'registration-contract-justification');
                        label6.textContent = 'Действует на основании: ';
                        p6.appendChild(label6);

                        let inputRegOrgRepresentJustification = document.createElement('input');
                        inputRegOrgRepresentJustification.setAttribute('id', 'registration-contract-justification');
                        inputRegOrgRepresentJustification.setAttribute('required', true);
                        inputRegOrgRepresentJustification.className = 'registration-form__input';
                        inputRegOrgRepresentJustification.dataset.rule = 'namefieldtext';
                        inputRegOrgRepresentJustification.dataset.maxlength = '30';
                        inputRegOrgRepresentJustification.setAttribute('type', 'text');
                        inputRegOrgRepresentJustification.setAttribute('name', 'contract_justification');
                        
                        let inputRegOrgRepresentJustificationValue = sessionStorage.getItem('regOrnRepJustificationInSessionStorage');
                        if (inputRegOrgRepresentJustificationValue === null) {
                            inputRegOrgRepresentJustificationValue = '';
                        } 
                        inputRegOrgRepresentJustification.setAttribute('value', inputRegOrgRepresentJustificationValue);

                        inputRegOrgRepresentJustification.addEventListener('blur', () => {
                            sessionStorage.setItem('regOrnRepJustificationInSessionStorage', inputRegOrgRepresentJustification.value);
        
                        });
                        p6.appendChild(inputRegOrgRepresentJustification);

                        let span6 = document.createElement('span');
                        span6.className = 'registration-error';
                        let span6_TextContent = '';
                        if (inphiddenwitherrorinfo.dataset.contractjustoforgerr != '') {
                            span6_TextContent = inphiddenwitherrorinfo.dataset.contractjustoforgerr + '<br>';
                        }
                        span6.innerHTML = ' *<br>' + span6_TextContent;
                        p6.appendChild(span6);

                        let span6_1 = document.createElement('span');
                        span6_1.className = 'productAddition-form__clearance';
                        span6_1.innerHTML = '<br>';
                        p6.appendChild(span6_1);

                        let span6_2 = document.createElement('span');
                        span6_2.setAttribute('id', 'registrationerrorcontractjustification');
                        span6_2.className = 'registration-error';
                        p6.appendChild(span6_2);
                    regOrgBlockContractInfoDiv.appendChild(p6);

                    let p7 = document.createElement('p');
                    p7.className = 'registration-form__input-item';
                        let label7 = document.createElement('label');
                        label7.className = 'label';
                        label7.setAttribute('for', 'registration-org-bankaccount');
                        label7.textContent = 'Банковский расчётный счёт организации:';
                        p7.appendChild(label7);

                        let inputRegOrgBankAccount = document.createElement('input');
                        inputRegOrgBankAccount.setAttribute('id', 'registration-org-bankaccount');
                        inputRegOrgBankAccount.setAttribute('required', true);
                        inputRegOrgBankAccount.className = 'registration-form__input';
                        inputRegOrgBankAccount.dataset.rule = 'orgfieldbankaccount';
                        inputRegOrgBankAccount.dataset.maxlength = '20';
                        inputRegOrgBankAccount.setAttribute('type', 'text');
                        inputRegOrgBankAccount.setAttribute('name', 'bankaccount_of_org');
                        
                        let inputRegOrgBankAccountValue = sessionStorage.getItem('regOrgBankAccountInSessionStorage');
                        if (inputRegOrgBankAccountValue === null) {
                            inputRegOrgBankAccountValue = '';
                        } 
                        inputRegOrgBankAccount.setAttribute('value', inputRegOrgBankAccountValue);

                        inputRegOrgBankAccount.addEventListener('blur', () => {
                            sessionStorage.setItem('regOrgBankAccountInSessionStorage', inputRegOrgBankAccount.value);
        
                        });
                        p7.appendChild(inputRegOrgBankAccount);

                        let span7 = document.createElement('span');
                        span7.className = 'registration-error';
                        let span7_TextContent = '';
                        if (inphiddenwitherrorinfo.dataset.bankaccoforgerr != '') {
                            span7_TextContent = inphiddenwitherrorinfo.dataset.bankaccoforgerr + '<br>';
                        }
                        span7.innerHTML = ' *<br>' + span7_TextContent;
                        p7.appendChild(span7);

                        let span7_1 = document.createElement('span');
                        span7_1.className = 'productAddition-form__clearance';
                        span7_1.innerHTML = 'Расчётный счёт организации состоит из 20-ти цифр.<br>';
                        p7.appendChild(span7_1);

                        let span7_2 = document.createElement('span');
                        span7_2.setAttribute('id', 'registrationerrorbankaccountorg');
                        span7_2.className = 'registration-error';
                        p7.appendChild(span7_2);
                    regOrgBlockContractInfoDiv.appendChild(p7);

                    let p8 = document.createElement('p');
                    p8.className = 'registration-form__input-item';
                        let label8 = document.createElement('label');
                        label8.className = 'label';
                        label8.setAttribute('for', 'registration-org-bicbank');
                        label8.textContent = 'Банковский идентификационный код (БИК):';
                        p8.appendChild(label8);

                        let inputRegOrgBankBic = document.createElement('input');
                        inputRegOrgBankBic.setAttribute('id', 'registration-org-bicbank');
                        inputRegOrgBankBic.setAttribute('required', true);
                        inputRegOrgBankBic.className = 'registration-form__input';
                        inputRegOrgBankBic.dataset.rule = 'orgfieldbicbank';
                        inputRegOrgBankBic.dataset.maxlength = '9';
                        inputRegOrgBankBic.setAttribute('type', 'text');
                        inputRegOrgBankBic.setAttribute('name', 'bicbank_of_org');
                        
                        let inputRegOrgBankBicValue = sessionStorage.getItem('regOrgBankBicInSessionStorage');
                        if (inputRegOrgBankBicValue === null) {
                            inputRegOrgBankBicValue = '';
                        } 
                        inputRegOrgBankBic.setAttribute('value', inputRegOrgBankBicValue);

                        inputRegOrgBankBic.addEventListener('blur', () => {
                            sessionStorage.setItem('regOrgBankBicInSessionStorage', inputRegOrgBankBic.value);
        
                        });
                        p8.appendChild(inputRegOrgBankBic);

                        let span8 = document.createElement('span');
                        span8.className = 'registration-error';
                        let span8_TextContent = '';
                        if (inphiddenwitherrorinfo.dataset.bicbankoforgerr != '') {
                            span8_TextContent = inphiddenwitherrorinfo.dataset.bicbankoforgerr + '<br>';
                        }
                        span8.innerHTML = ' *<br>' + span8_TextContent;
                        p8.appendChild(span8);

                        let span8_1 = document.createElement('span');
                        span8_1.className = 'productAddition-form__clearance';
                        span8_1.innerHTML = 'БИК банка организации состоит из 9-ти цифр.<br>';
                        p8.appendChild(span8_1);

                        let span8_2 = document.createElement('span');
                        span8_2.setAttribute('id', 'registrationerrorbicbankorg');
                        span8_2.className = 'registration-error';
                        p8.appendChild(span8_2);
                    regOrgBlockContractInfoDiv.appendChild(p8);

                    let regOrgContractAddInfoDiv = document.createElement('div');
                    regOrgContractAddInfoDiv.className = 'registration-form__input-item';
                    regOrgContractAddInfoDiv.setAttribute('id', 'regOrgContractAddfield');
                        let lableRegOrgAddInfo = document.createElement('label');
                        lableRegOrgAddInfo.className = 'label';
                        lableRegOrgAddInfo.setAttribute('for', 'contract_addition')
                        lableRegOrgAddInfo.textContent = 'Дополнительная информация, необходимая для оформления договора:';
                        regOrgContractAddInfoDiv.appendChild(lableRegOrgAddInfo);

                        let regOrgContractAddInfoDiv2 = document.createElement('div');
                        regOrgContractAddInfoDiv2.className = 'registration-form__input-address';
                        regOrgContractAddInfoDiv2.setAttribute('id', 'contract_addition');
                        regOrgContractAddInfoDiv2.setAttribute('contenteditable', true);
                        regOrgContractAddInfoDiv2.dataset.checkcontractaddinfo = 'checkcontractaddinfo';
                        let regOrgContractAddInfoDiv2Content = sessionStorage.getItem('regOrgAddInfoContentInSessionStorage');
                        if (regOrgContractAddInfoDiv2Content === null) {
                            regOrgContractAddInfoDiv2Content = '';
                        }
                        regOrgContractAddInfoDiv2.textContent = regOrgContractAddInfoDiv2Content;  
                        regOrgContractAddInfoDiv2.addEventListener('blur', () => {
                            sessionStorage.setItem('regOrgAddInfoContentInSessionStorage', regOrgContractAddInfoDiv2.textContent);

                        });
                        regOrgContractAddInfoDiv.appendChild(regOrgContractAddInfoDiv2);

                        let spanFieldAddContractInfo = document.createElement('span');
                        spanFieldAddContractInfo.className = 'registration-error';
                        let spanFieldAddContractInfoTextContent = '';
                        if (inphiddenwitherrorinfo.dataset.contractaddoforgerr != '') {
                            spanFieldAddContractInfoTextContent = inphiddenwitherrorinfo.dataset.contractaddoforgerr + '<br>';
                        }
                        spanFieldAddContractInfo.innerHTML = spanFieldAddContractInfoTextContent;
                        regOrgContractAddInfoDiv.appendChild(spanFieldAddContractInfo);
                        
                        let spanElemForClearFieldAddContractInfo = document.createElement('span');
                        spanElemForClearFieldAddContractInfo.className = 'productAddition-form__clearance';
                        spanElemForClearFieldAddContractInfo.innerHTML = 'Указываются дополнительные счета, иные необходимые реквизиты.<br>';
                        regOrgContractAddInfoDiv.appendChild(spanElemForClearFieldAddContractInfo);
                        
                        let spanElemForRegOrdAddInfoError = document.createElement('span');
                        spanElemForRegOrdAddInfoError.className = 'registration-error';
                        spanElemForRegOrdAddInfoError.setAttribute('id', 'registrationerrororgcontractaddition');
                        regOrgContractAddInfoDiv.appendChild(spanElemForRegOrdAddInfoError);
                    regOrgBlockContractInfoDiv.appendChild(regOrgContractAddInfoDiv);

                    let inputregOrgContractAddInfo = document.createElement('input');
                        inputregOrgContractAddInfo.setAttribute('id', 'hiddenInputRegistrationOrgContractAdd');
                        inputregOrgContractAddInfo.setAttribute('type', 'hidden');
                        inputregOrgContractAddInfo.setAttribute('name', 'contract_addition');
                        inputregOrgContractAddInfo.setAttribute('value', regOrgContractAddInfoDiv2Content);
                    regOrgBlockContractInfoDiv.appendChild(inputregOrgContractAddInfo);

                    let regOrgWantToKnowContractDiv = document.createElement('div');
                    regOrgWantToKnowContractDiv.className = 'registration-org__p-center';
                        let spanInfoContractTypeIPVolume = document.createElement('span');
                        spanInfoContractTypeIPVolume.textContent = 'Договор (ИП) ';
                        regOrgWantToKnowContractDiv.appendChild(spanInfoContractTypeIPVolume);

                        let regOrgWantToKnowContractLink = document.createElement('a');
                        regOrgWantToKnowContractLink.className = 'a-text-black';
                        regOrgWantToKnowContractLink.setAttribute('href', '/project/webroot/docs/tipovoy-dogovor-kupli-prodazhi-ip.pdf');
                        regOrgWantToKnowContractLink.setAttribute('target', '_blank');
                        regOrgWantToKnowContractLink.textContent = 'ознакомиться ';
                        regOrgWantToKnowContractDiv.appendChild(regOrgWantToKnowContractLink);

                        let spanInfoContractTypeIPVolumeInPdf = document.createElement('span');
                        spanInfoContractTypeIPVolumeInPdf.innerHTML = '<i>(.pdf, 167 Кб)</i>';
                        regOrgWantToKnowContractDiv.appendChild(spanInfoContractTypeIPVolumeInPdf);

                    regOrgBlockContractInfoDiv.appendChild(regOrgWantToKnowContractDiv);
                    
                    let regOrgNeedsSpecContractDivMain = document.createElement('div');
                    regOrgNeedsSpecContractDivMain.className = 'registration-form__input-item d-flex flex-sb';
                    regOrgNeedsSpecContractDivMain.setAttribute('id', 'registration_org_checkbox_special_contract');
        
                        let regOrgNeedsSpecContractLabel = document.createElement('lable');
                        regOrgNeedsSpecContractLabel.setAttribute('for', 'registration_org_special_contract');
                        regOrgNeedsSpecContractLabel.innerHTML = 'Предложим свой вариант договора';
                        regOrgNeedsSpecContractDivMain.appendChild(regOrgNeedsSpecContractLabel);
        
                        let regOrgNeedsSpecContractInputCheckBox = document.createElement('input');
                        regOrgNeedsSpecContractInputCheckBox.setAttribute('type', 'checkbox');
                        regOrgNeedsSpecContractInputCheckBox.setAttribute('id', 'registration_org_special_contract');
                        regOrgNeedsSpecContractInputCheckBox.setAttribute('name', 'orgneedsspecialcontract');
                        regOrgNeedsSpecContractInputCheckBox.setAttribute('value', 'yes');
                        
                        let regOrgNeedsSpecContractValue = sessionStorage.getItem('regOrgNeedsSpecContractInSessionStorage');
                        // console.log(regOrgNeedsSpecContractValue);
                        if (regOrgNeedsSpecContractValue === null) {
                            regOrgNeedsSpecContractInputCheckBox.hasAttribute('checked') ? regOrgNeedsSpecContractInputCheckBox.removeAttribute('checked') : true;
                        } else {
                            regOrgNeedsSpecContractInputCheckBox.hasAttribute('checked') ? true : regOrgNeedsSpecContractInputCheckBox.setAttribute('checked', true);
                        }
                        
                        regOrgNeedsSpecContractInputCheckBox.addEventListener('click', () => {
                            regOrgNeedsSpecContractInputCheckBox.hasAttribute('checked') ? regOrgNeedsSpecContractInputCheckBox.removeAttribute('checked') :  regOrgNeedsSpecContractInputCheckBox.setAttribute('checked', true);
                            regOrgNeedsSpecContractInputCheckBox.hasAttribute('checked') ? sessionStorage.setItem('regOrgNeedsSpecContractInSessionStorage', true) : sessionStorage.removeItem('regOrgNeedsSpecContractInSessionStorage');
                            // console.log(regOrgNeedsSpecContractInputCheckBox.hasAttribute('checked'));
                            // console.log(sessionStorage.getItem('regOrgNeedsSpecContractInSessionStorage'));
                        });
                        regOrgNeedsSpecContractDivMain.appendChild(regOrgNeedsSpecContractInputCheckBox);

                        //let regOrgNeedsContractInputCheckBox = document.querySelector('#registration_org_regular_contract');    // находим чекбокс, который активирует блок полей для ввода данных для оформления договора
                        //if(regOrgNeedsContractInputCheckBox) {regOrgNeedsContractInputCheckBox.hasAttribute('checked') ? regOrgNeedsContractInputCheckBox.removeAttribute('checked')  : true};  // если такой чек найден, а он должен быть - смотрим отмечен он или нет...
                        //regOrgBlockContractInfoDiv.style.display = '';  // если убираем "чек", что действую от имению юр-лица, убираем (если был визуализирован) блок ввода данных для оформления договора
            
                        // проверяем поля имени и фамилии, и адреса в том числе:
                        checkInputedFormFields();
                        //делаем проверку корректности ввода текста в поля формы дополнительной информации для договора в диве... :
                        checkInputedContractAddInfosDiv(hiddenInputRegistrationOrgContractAdd);

                    regOrgBlockContractInfoDiv.appendChild(regOrgNeedsSpecContractDivMain);  
                } else {
                    sessionStorage.removeItem('regOrgNeedsContractInSessionStorage');
                    regOrgBlockContractInfoDiv.textContent = '';
                    regOrgBlockContractInfoDiv.style.display = '';
                }     
            }
            
        } else {
            registrationOrgBlock.textContent = '';
            registrationOrgBlock.style.display = '';
        }
    }