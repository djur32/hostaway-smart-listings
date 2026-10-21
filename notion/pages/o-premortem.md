<callouticon=✅ color=gray_bg>
	**OutputPlanned** · Imagineitshippedandfailed. SevenwaysSmartListingscouldfailtheearlysignalforeachthetestthatcatchesitandwhatI'ddo. Everyrowisor; nothinghasshipped.
</callout>
## Theshortversion
- **Thepremise** twelvemonthsafterlaunchSmartListingsdidn'twork. Hostsdidn'ttrustitdidn'tuseitoritbrokesomething. Why?
- Thestoriesareorderedbyhowbadlyeachwouldhurtthebusinessresultchurnenterprisedealsandsupport.
- Mostarecaughtbyastudyalreadyinthe<mention-pageurl=https//app.notion.comp3eee18af164581b1958cc8edfcf3dcfe>Testplan</mention-page>.
- ThreeneedsomethingbuiltfirstanofflinecheckofAIoutputaconfirmationeventperfieldandchannelanddriftdetectionwhenahosteditsonthechannel.
- Thresholdsarewrittennowbeforeanydataarrives.
## Thefailurestories
<tableheader-row=true>
	<tr>
		<td>Whatwentwrong</td>
		<td>Earlysignal</td>
		<td>Testthatcatchesit</td>
		<td>WhatI'ddo</td>
	</tr>
	<tr>
		<td>**1SmartListingsoverwrotesomethingthehostcaredabout.** AnAutopilotchangereplacedavaluethehosthadtunedonAirbnbandnobodynoticeduntilaguestdid.</td>
		<td>Overwriteincidents; undorateandhowsoonafterachange</td>
		<td>Pilotrulenodata-lossincident. Aneventcheckbeforethepilot.</td>
		<td>Anyincidentstopstherolloutstep. Builddriftdetectionwhichdoesn'texist. DecidewhethersupportgetsarestorebeyondUndo.</td>
	</tr>
	<tr>
		<td>**2Hostsdon'tunderstandchannel-first.** Theycan'tsaywhereafactlivesorwhatachangedoesonAirbnb. TheycopyfactsintoeverychanneltobesafeorreadthelockedBooking.comonlyasabug.</td>
		<td>Comprehensionscore; wrong-channeledits; channelvaluesequaltotheBase; ticketsaboutthelockeddescription</td>
		<td>Treetest(3trees), structureABthink-aloudprobes</td>
		<td>Reworklabels. IfcomprehensionstillfailsaftertworoundsmostlyforfamilyhostsandhostsnewtoaPMSrevisitthechannel-firstmenuandtestarecord-firstvariant. Checkthereplicaoftoday'sproductagainstrealscreenshotsfirstortheABleanstowardtheredesign.</td>
	</tr>
	<tr>
		<td>**3TheAIsayssomethinguntrueinpublic.** AtiporanAutopilotrewriteclaimsanamenitythehomedoesn'thaveastoday'sAsktheAIdidwithwheelchairaccess.</td>
		<td>AIcopyrevertedorcomplainedabout; dismissalsbyelement</td>
		<td>Nothingtoday. Neededanofflinesetofabout200reallistings× tiptypesscoredforunsupportedclaimschannellimitsandtone. Gatezerounsupportedclaimsbeforethepilot.</td>
		<td>Above10% revertedturnthattiptypeoffforthatchannel. AnychannelstrikepausesAutopilotforeveryhost.</td>
	</tr>
	<tr>
		<td>**4Thechannelswon'ttakewhatHostawaysends.** Rejectionsratelimitsortermsagainstautomatedcontentupdates.</td>
		<td>Fieldsrejectedperfieldsent≤ 2%, neversilent</td>
		<td>Eventcheckonchannelsandboxesintheinternalrolloutstep</td>
		<td>WithdrawAutopilotonthatchannel; tipsstay. Theconfirmationeventperfieldandchanneldoesn'texisttodaysoit'sthefirstengineeringask.</td>
	</tr>
	<tr>
		<td>**5SmartListingsisignored.** Somehostsneverturniton; thosewhododismissmosttips.</td>
		<td>Opt-in(35% ofeligiblepropertiesat6months); acceptancebychannelelementandsource</td>
		<td>Trustprobesinthethink-aloud; thepilot</td>
		<td>StopinvestinginAutopilotandkeeptipslight. Reportopt-inonlyforthepersonasit'sonbydefaultfor(SEOoptimizersandportfoliomanagers).</td>
	</tr>
	<tr>
		<td>**6Labwinsdon'tsurviverealuse.** FasterintheABnofasterintheproduct.</td>
		<td>Timetoadjustinthelabvsintheproductonthesameindex</td>
		<td>Pilotagainstamatchedholdout</td>
		<td>Iftheproductlagsthelabbymorethan20indexpointsreviewthefield-levelfunnelbeforegeneralrelease.</td>
	</tr>
	<tr>
		<td>**7Hostawaycan'tlearnafterlaunch.** Performancecomparesastrategywiththestretchbeforeitandseasonandpriceconfoundthat.</td>
		<td>Strategyperiodstooshorttocompare; widerangesonoccupancyandrevenue</td>
		<td>Notestcatchesit; thescreenhastosayit</td>
		<td>GivePerformanceanotenoughdatayetverdictbeforeanyhostreadsachangeasproof. Thebuildonlyholdsresultsbackinastrategy'sfirstweek. Ithasnominimum-runruleafterthat. Savedversionscomebackonlyifperiodsproveunusable.</td>
	</tr>
</table>
## Whattobuildbeforethefirsttest
1. **Eventsbeforefeatures.** Aconfirmationperfieldandchannelwhenachangelandsthenthetipandundoevents. Checkeachoneintheinternalstep.
2. **Arealbaseline.** Thebenchmarkoftoday'sproductreplaceseverysimulatedbaseline.
3. **Afaithfulreplica** oftoday'slistingscreensforthestructureAB.
4. **AnofflineAIevaluationset** withthezero-unsupported-claimsgate. Theonenewinstrumentthispageadds.
5. **Overrideanddriftdata.**Editperchannelusageperfieldtodayanddriftdetectionwhenahosteditsonthechannel.
6. **Flagsandaholdout.** Per-accountflagsa10% long-termholdoutandAutopilotswitchableperchannelandpertiptypesoeachturnitoffisoneswitchnotarelease.
7. **Legalandchanneltermscleared** beforeAutopilotleavesthepilotAIcopyliabilityanddisclosurecompsunderGDPRchanneltermsonautomatedcontent.
## Howasignalbecomesachange
- **Weekly** thedashboardandtheunknownslog. Eachredguardrailgetsanowner; eachsurprisebecomesaprobeanopenquestionorisclosedwithareason.
- **Eachtestround** issuesbyseveritymeasuredagainstthebenchmark. Eachchangeisrecordedasadecisionandshipsbehindaflagtothepilotfirst.
- **Eachrolloutstep** thedecisionrulesdecideshipiterateorrollbackwrittendownwiththenumbersthatdecidedit.
- **Eachquarter** timetoadjustandticketsagainsttheholdoutandthe<mention-pageurl=https//app.notion.comp3eee18af1645818daddff9b46244175c>Roadmap</mention-page>'skillcriteriakeepchangedirectionorstop.
## Howitwasmade
Aprojectpre-mortemassumethelaunchfailedlistwhythengiveeachfailureanearlysignalandatestbeforeitcanhappen([KleinPerformingaprojectpremortemHBR](https//hbr.org200709performing-a-project-premortem)). Theoriginallistalsocoveredsetup; thosestoriesmovedtotheRoadmapwiththeimportwork.
---
**Buildson**
- <mention-pageurl=https//app.notion.comp3eee18af1645813d9391e336e308e3d7>Goals& KPIs</mention-page>
- <mention-pageurl=https//app.notion.comp3eee18af164581b1958cc8edfcf3dcfe>Testplan</mention-page>
**Feeds**
- <mention-pageurl=https//app.notion.comp3eee18af1645815caf9bc8e55ee265e9>Second-ordereffects</mention-page>
- <mention-pageurl=https//app.notion.comp3eee18af1645818daddff9b46244175c>Roadmap</mention-page>
**Decisions**
- <mention-pageurl=https//app.notion.comp3eee18af1645812eb43fd00ba5a5cd09>KD-19</mention-page>
- <mention-pageurl=https//app.notion.comp3eee18af16458160a7c1c703fcb2a033>KD-08</mention-page>
- <mention-pageurl=https//app.notion.comp3eee18af1645812290f5e2113a9a0844>KD-07</mention-page>
**Intheprototype**
- [AirbnblistingwithAutopiloton]
