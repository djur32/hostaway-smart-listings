<callouticon=✅ color=gray_bg>
	**OutputDone** · Howoneproperty'slistingissharedbyeverychannelandhoweachchannelkeepsonlywhatdiffers. ProvenancescreensreplicateHostaway; listingvaluesare.
</callout>
![Airbnb› Listing› Essentialsintheliveprototype. PhotosandSummaryareCustomforAirbnb; PropertynameusestheBase. Values.](file-upload//3eee18af-1645-8134-bc50-00b21bbedb56)
## Theshortversion
- The**Listingbase**, inSharedholdswhateverychannellistsDetailsPricingandAvailability.
- Each**channel** (AirbnbBooking.comDirect) hasfourpagesListingPricingAvailabilityandBookingpolicies. Theyholdonlythatchannel.
- Onachannelpageeveryfield**usestheBase**, is**customforthatchannel**, exists**onlyonthatchannel**, oris**setbythechannel** andcan'tbechanged. Thecaptionunderthefieldsayswhich; forthefirsttwoonelinkswitchesit.
- SwitchingbacktotheBaseneverthrowsawaythecustomvalue.
- EveryeditisadraftuntilSaveonebaroneSaveandtheconfirmationnamesthechannelsthechangereached.
## Twolayers
<columns>
	<column>
		### Listingbase(Shared)
		DetailsPricingAvailability
		- DetailskeepsHostaway'sfivetabs(EssentialsArrivalLocationAmenitiesRules) anditsfieldorder.
		- ASourceoftruthchipbythetitleexplainshowchannelsusethesevalues.
		- Underafieldⓘ 2channelssayshowmanychannelstakethisvalue; hoveringnamesthem. ItisinformationonlywithnoEditperchannel.
		- SavingsendsthechangetoeverychannelthatusestheBase. Achannelwithitsownvaluekeepsit.
	</column>
	<column>
		### Achannel'spages
		ListingPricingAvailabilityBookingpolicies
		- Eachpagespeaksaboutonechannelandnevershowsanotherchannel'svalues.
		- Afieldthatonlyonechannelhaslivesonlythere. Airbnb'sCheck-inmethodandGuestcheckouttasksareonAirbnb› ListingnotontheBaseortheotherchannels.
		- ValueseverychannelshareslikeWi-Fiorthenightlyratereadⓘ AllchannelsEditforallchannels. Savingonechangeseverychannelandanoteunderthefieldsaysso.
	</column>
</columns>
## Fourcasesforafield
<tableheader-row=true>
	<tr>
		<td>Case</td>
		<td>Howthefieldlooks</td>
		<td>Captionlink</td>
		<td>Exampleintheprototype</td>
	</tr>
	<tr>
		<td>**UsestheBase**</td>
		<td>Theinput'sdisabledlookshowingtheBasevalue</td>
		<td>ⓘ UsestheBase**CustomizeforAirbnb**</td>
		<td>Airbnb› Propertyname</td>
	</tr>
	<tr>
		<td>**Customforthechannel**</td>
		<td>Anormaleditableinput</td>
		<td>ⓘ CustomforAirbnb**UsetheBase**</td>
		<td>Airbnb› SummaryPhotos</td>
	</tr>
	<tr>
		<td>**Onlyonthatchannel**</td>
		<td>Anormaleditableinputonthatchannel'spagealone</td>
		<td>ⓘ Airbnbonlynolink</td>
		<td>Airbnb› Check-inmethodGuestcheckouttasks</td>
	</tr>
	<tr>
		<td>**Setbythechannel**</td>
		<td>Read-onlywithalockwhosetooltipsayswhy</td>
		<td>Booking.comonlywiththelocknolink</td>
		<td>Booking.com› SummaryBooking.comwritesitsowndescription</td>
	</tr>
</table>
HoveringthecaptionshowstheBasevalueandeachchannel'sownvaluesidebyside.UsetheBasekeepsthecustomtextinthedraftsoCustomizeforAirbnbbringsitback; aroundtripwithnorealchangeleavesnothingtosave.
<columns>
	<column>
		![Listingbase› Details. TheSourceoftruthchipandtheinformationalⓘ Nchannelscaptions. Values.](file-upload//3eee18af-1645-81ef-ae83-00b24124c596)
	</column>
	<column>
		![Booking.com› Listing. PhotosandPropertynamearecustomforBooking.com. SummaryissetbyBooking.comread-onlywithalock. Values.](file-upload//3eee18af-1645-8139-a1c0-00b222b2cf63)
	</column>
</columns>
## Whatnevervariesandwhatonechannelowns
- **Locked** PropertytypeRoomtypeandtheaddress(countrystreetunitcitystateZIP) arefixedoncethelistingexists. OntheBasetheyshowalockwiththereasoninatooltip; onchannelpagestheydon'tappearatall. ThemappinkeepsitsEdit. Thereason'swordingisan.
- **Channel-only** fieldsasinglechannelhasandthechannelmarkuponPricingliveonthatchannel'spage.
- **Photos** onesetontheBase. AchanneleitherusestheBasesetandorderorshowsandhidesphotosandreordersthemforitself. NewphotosareaddedontheBaseonly. Managephotosopensafull-screenviewlockedtothatchannel.
## OnedraftoneSave
TypingCustomizeUsetheBaseandphotochangesallstayinadraftandsodotipsacceptedonPricingandAvailability. An**Unsavedchanges** barappearsonlyoncesomethingdiffersfromwhatissavedpinnedtothebottomoftheareabeingedited. LeavingwithunsavedchangesasksKeepeditingDiscardchangesorSavechanges. AfterSaveaquietlinesayswhereitwente.g.SavedsenttoAirbnbandBooking.com. Acceptingatiponachannel'sListingistheonechangesentatoncewithUndo.
**Open** researchsaysBooking.comauthorsitsowntitleanddescriptionandHostawaycan'twritethem(<mention-pageurl=https//app.notion.comp3eee18af1645818c859bcd3115fce28e>Channelconstraints</mention-page>). TheprototypesetsthedescriptionbyBooking.combutstillletsthepropertynamebecustomisedthere.
## Whyitworksthisway
- Hostschangemoneyandstayrulesperchannelfarmorethanwords(research<mention-pageurl=https//app.notion.comp3eee18af1645818094e8d80d9ddf2acd>Insights</mention-page>). SoPricingAvailabilityandBookingpoliciesgetthesameper-channeltreatmentasthelistingtext.
- ChannelshavedifferentfieldsandrulesandBooking.comwritesitsowndescription(<mention-pageurl=https//app.notion.comp3eee18af1645818c859bcd3115fce28e>Channelconstraints</mention-page>). HencetwomorecasesbesidestheBaseandcustomfieldsthatexistononechannelonlyandfieldsthechannelsets.
- TodayEditperchannelisscatteredacrossabout15fieldsandopeningitalonemarkstheformaschanged(<mention-pageurl=https//app.notion.comp3eee18af16458163b059f704859d3a6a>Current-statemap</mention-page>).
## Howitwasmade
Builtintheprototype'scodeonHostaway'srealDetailsPricingandAvailabilityscreensthenreviewedscreenbyscreen. Themodelitimplementsisin<mention-pageurl=https//app.notion.comp3eee18af16458168b8ede129bf1dc3a9>Objectmodel</mention-page> and<mention-pageurl=https//app.notion.comp3eee18af164581d6b4e2c132983137ce>Sitemap</mention-page>.
---
**Buildson**
- <mention-pageurl=https//app.notion.comp3eee18af1645818094e8d80d9ddf2acd>Insights</mention-page>
- <mention-pageurl=https//app.notion.comp3eee18af1645818c859bcd3115fce28e>Channelconstraints</mention-page>
- <mention-pageurl=https//app.notion.comp3eee18af16458168b8ede129bf1dc3a9>Objectmodel</mention-page>
- <mention-pageurl=https//app.notion.comp3eee18af164581bdb0f8dd25c3d311a4>Finalconcept</mention-page>
**Feeds**
- <mention-pageurl=https//app.notion.comp3eee18af1645811a82c4e772997ac875>Tips& AIrewrite</mention-page>
- <mention-pageurl=https//app.notion.comp3eee18af16458187b60ec60bb6c3c5c5>Canvaspreview</mention-page>
- <mention-pageurl=https//app.notion.comp3eee18af1645811f8fcfcbffc7cbb69d>KnowledgeHub</mention-page>
**Decisions**
- <mention-pageurl=https//app.notion.comp3eee18af1645813ab697f55d6d253754>KD-02</mention-page>
- <mention-pageurl=https//app.notion.comp3eee18af16458164b971f07e49e0fa84>KD-04</mention-page>
- <mention-pageurl=https//app.notion.comp3eee18af164581a693f6c6cc544b8c1a>KD-15</mention-page>
**Intheprototype**
- [Listingbase› Details]
- [Airbnb› Listing]
- [Booking.com› Listing]
