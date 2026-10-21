<callouticon=✅ color=gray_bg>
	**OutputDone** · The26findingsonthelisting-managementscreensSmartListingsredesignseachwiththeheuristicitbreaksandwhatthedesigndoesaboutit. Provenance; severitiesare(oneevaluator).
</callout>
## Theshortversion
- TheworstproblemsarestructuralaKnowledgeHubthatrepeatsthelistinginacopythatdriftsnoviewofonelistingononechannelandanAIthattellsgueststhingsthelistingdoesn'tsay.
- Per-channelcontrolexistsbutinsevenformsanditslabelneversayswhichchannels.
- Changesofownershiphappensilentlyandsavingsaysnothingaboutwhatreachedeachchannel.
- TheCalendartakesthehostoutoftheproperty.
## Method
Oneevaluatorwalkedthelisting-managementscreens(thesuppliedscreenshotsplustheread-onlytrialpass) againstNielsen's10heuristicsandsixforlistingssource-of-truthclaritysync-directionvisibilityper-channelawarenessreversibilityAItransparencyandbulk. SeverityusesNielsen's0–4scalewhere4meanswronginformationreachesguestsmoneyislostorthejobisblocked. Withoneevaluatortheseveritiesare. 26findings14mainones(somerowscombinetwo) and12smallerones.
## Mainfindings(14in11rows)
| Finding| Heuristic| Where| Sev| Whatthedesigndoesaboutit|
|---|---|---|---|---|
| **TheKnowledgeHubrepeatsthelistinginitsowncopy.** ItisgeneratedfromDetailsandpastmessagesandnevertoldwhenDetailschangessothecopydriftsbydesign. Onatriallistingthesamefactsreaddifferentlyineach. | L1Source-of-truthclarityL5AItransparency| Details› RulesvsKnowledgeHubHS-28HS-44| 4| ListingdetailsliveonceintheListingbase. TheKnowledgeHubreadsthemkeepsnocopyandaddsthesituationsbehindthem. → Listingbase& channelsKnowledgeHub|
| **TheAIstateswhatthelistingdoesn't.** AsktheAItellsaguesttheflatiswheelchairaccessible; noamenitysayssoandtheanswershowsnosource. | L5AItransparency| KnowledgeHub› AsktheAIHS-43trialpass| 4| theassistantanswersguestsonlyfromlistingdetailsandfromFactsthehostwroteorconfirmed. Whennothingbacksanansweritsayssoandasksthehost. Everytipshowswhatitrestson. → Tips& AIrewrite|
| **Noviewofonelistingononechannel.** ToseewhatAirbnbshowsthehostchecksabout15fieldsacrossfivetabs. | L3Per-channelawareness| AllpropertytabsHS-21toHS-39| 4| EachchannelhasitsownListingPricingAvailabilityandBookingpoliciespagesandCanvasshowsthatchannel'sguestpage. → Canvaspreview|
| **Ownershipflipssilentlyonthefirstedit.** EditingthebasepricewilloverwritethepriceonAirbnbsaidonceinaparagraph. Photosgetaone-timebanner. Otherfieldssaynothing. | L2Sync-directionvisibilityL4Reversibility| Pricing› BasepriceHS-30; photomanagertrialpass| 4| EveryfieldstateswhosevalueitisusestheBasecustomisedforthechannelonlyonthatchannelorsetbythechannel. → KD-04|
| **Sevenpatternsforoneidea.**DifferentonthischannelappearsasalabelpluslinkalabelaloneAllchannelsaone-channelfieldarowperlistingagridandapage. Thelabelsayshowmanychannelsnotwhich. | N4ConsistencyandstandardsL3Per-channelawareness| DetailsPricingAvailabilityBookingpoliciesHS-26HS-33HS-35HS-39HS-47| 3| Oneruleoneveryfieldandhoveringafield'slabelshowstheBasevaluenexttoeachchannel'sown. → Listingbase& channels|
| **Lookingcreatesoverrides.** OpeningEditperchannelmarkstheformaschangedwithnoeditmade; ahostwholooksandthensaveshassplitthefield. | L2Sync-directionvisibilityL4Reversibility| Details› Essentialstrialpass| 3| OnachannelpageaBasevalueisshownread-only. CustomisingisanexplicitCustomizeforAirbnbundonewithUsetheBase. → Listingbase& channels|
| **Savesaysnothingaboutthechannels.** NosenttoAirbnbnolast-syncedtimenoper-channelerrornohistoryandnoundo. | N1VisibilityofsystemstatusL2Sync-directionvisibilityL4Reversibility| DiscardSaveoneverytabHS-28HS-33| 3| Saveisthecommit; eachsavedchangegoesoutwithareceiptandanacceptedtipcanbeundone. → KD-15UIchanges|
| **Publishinghasnopreview.**PublishlistingistheoneoptionintheOverviewstatusmenu; nothingshowswhatguestswillsee. | L4Reversibility| Overview› statustrialpass| 3| Canvasrenderseachchannel'sguestpagefromthesamedataandtappingapartopensitsfield. → Canvaspreview|
| **TheCalendarleavestheproperty.** Themenu'sCalendaropenstheglobalCalendar; thepropertymenudisappearsandthere'snowayback. | N3Usercontrolandfreedom| CalendarHS-32| 3| CalendarstaysinsidethepropertyunderShared. → UIchanges|
| **Per-channelmoneyhastwoeditorsthatdisagree.** PricingandtheCalendarsidepanelbotheditfeesanddepositsandlistdifferentchannels. | L3Per-channelawarenessN4Consistencyandstandards| Pricing› SecuritydepositsvsCalendarpanelHS-35HS-32| 2| TheBasepricelivesinListingbase› Pricing; whatachanneldoesdifferentlylivesonthatchannel'sPricingpage. → Listingbase& channels|
| **RecommendationsareAirbnb'salone.** ReviewopportunitiesopensAirbnb'sownlistbehindalinkanditwasemptyforthislisting. NothingcoversBooking.comorDirect. | L3Per-channelawareness| OverviewHS-21trialpass| Notrated| SmartListingsgiveseverychanneltipsonitsownpagesonmoneyandstayrulesaswellascopy. → Strategy& performance|Notratedseenonthetrialaccountandnevergivenaseverity.
## Smallerfindings(12)
Severity1–2consistencylabelsandcopyonthesamescreens.
| Finding| Heuristic| Where| Sev| Whatthedesigndoesaboutit|
|---|---|---|---|---|
| **Addressfieldsaredisabledwithnoreason.** CountryCityandStatearegreyedout. | L2Sync-directionvisibility| Details› LocationHS-24| 2| Fixedalockwithareason(setwhenthelistingiscreated); thepinstayseditable. |
| **Channelsaren'tonekindofthing.** Directhasitsownmenuitem; Airbnb'ssettingsarespreadacrosseverytab. | N4Consistencyandstandards| PropertymenuHS-47HS-55| 2| Fixedeverychannelhasthesamepagegroup(ListingPricingAvailabilityBookingpolicies). |
| **Onescopetwolabels.**AllchannelsonAmenitiesⓘ 1channeleverywhereelse. | N4Consistencyandstandards| Details› AmenitiesvsothertabsHS-22HS-26| 1| Fixedoneⓘ NchannelscaptiononeveryBasefieldwithatooltipnamingthechannels. |
| **Currencyonsomefeesnotothers.** Resortandmanagementfeeshaveacurrencyselector; cleaningandpetfeesdon't. | N4Consistencyandstandards| Pricing› FeesHS-33| 1| Fixedeverymoneyfieldshowsitscurrencyinthesameboxontheleft. |
| **AsktheAIoverlapsthefacts.** Thestickybarcoversrowswhilescrolling. | N8Aestheticandminimalistdesign| KnowledgeHubHS-43–46| 1| FixedtheHubisrebuiltasQuestionsInsightsFactsandSourceswithTestbesideQuestionsandFacts. |
| **Copydefects.**dont1channelsthreefeessharingonehelpertext. | N10Helpanddocumentation| PricingHS-30HS-33HS-34| 1| Fixedthecopyisrewritten. |
| **AmenitieshasnoSave**, unlikeeveryothertab. | N4Consistencyandstandards| Details› AmenitiesHS-22HS-26| 2| PartlyoneSavebarforeverydraftbuttheAddamenitydrawerstillsaveswhenitclosesasintherealproduct. |
| **LeadlistingandFullymanagedaren'texplained.** | L1Source-of-truthclarity| OverviewHS-21| 2| PartlyeachpillhasatooltipandFullymanagedsayswhatHostawaymanages;Leadlistingstillisn'texplained. |
| **Asharedfactnamesonechannel.**ContactthehostviatheAirbnbmessagingsystem. | L1Source-of-truthclarity| KnowledgeHubHS-44| 2| PartlyHubanswersarewrittenforthelistingneverforonechannel. |
| **Arrivalissplit.** Check-inmethodsitsunderArrivalcheck-intimeunderRules. | N6Recognitionratherthanrecall| Details› ArrivalvsRulesHS-22HS-28| 2| NotfixedtheprototypekeepsHostaway'stabs. |
| **TheWi-Fipasswordisshowninplaintext** inDetailsandintheKnowledgeHub. | N5Errorprevention(security) | Details› ArrivalKnowledgeHubHS-22HS-46| 2| Notfixedstillplaintextintheprototype. |
| **Hubgenerationshowsagreenprogressbar**, whereprogresselsewhereisraspberry. | N1Visibilityofsystemstatus| KnowledgeHub› GenerateHS-41| 1| NotintheprototypeHubgenerationisn'trebuilt. |
## Theworstonesonscreen
ThreescreenshotsDetails› Rules(`imgdc-hs-28.png`), Pricing› Baseprice(`imgdc-hs-30.png`), theCalendarleavingtheproperty(`imgdc-hs32-calendar-exit.png`).
## Howitwasmade
PartofProductaudit.

(ReporecordoftheNotionpagehttps//app.notion.comp3eee18af1645817899d8edd811bf9212writteninplainmarkdowntables; thelivepageusesNotiontablesmentionsanduploadedimages.)
