<callouticon=✅ color=gray_bg>
	**OutputDone** · Thepropertymenuexactlyastheprototypebuildsitwithonelineonwhateachpageholds. Provenance(theliveprototypeanditscode).
</callout>
## Theshortversion
- Thepropertymenuhasthreeparts**Overview**, **Shared** (whateverychannelreads) and**Channels** (onegroupperconnectedchannel).
- Everychannelgrouphasthesamefourpageseachwithitscountofopentips.
- **SmartListings** (StrategyPerformance) appearsinSharedonlywhenit'son.
- Twoflowsrunfullscreenoutsidethemenuthe**strategywizard** andthe**Booking-policyflow**.
- TheglobalsidebarisHostaway'sown. OnlyPropertiesnavigates.
## Thepropertymenu
<columns>
	<columnratio=36>
		![ThepropertymenuintheprototypeAirbnbopenOverviewthenSharedthenChannelswithopentipscountedperpage. Sampledata.](file-upload//3eee18af-1645-81fd-9881-00b227f325c3)
	</column>
	<columnratio=64>
		- **Overview** · Hostaway'spropertypageconnectedchannelscalendarssynctheSmartListingsswitchandFieldvisibility.
		- **Shared**
			- **Listingbase** › DetailsPricingAvailabilitythevalueseverychanneluses. Eachfieldsayshowmanychannelsuseit.
			- **KnowledgeHub** › QuestionsInsightsFactsSourceswhatguestsaskwhatitteachesthelistingdetailsitreadsfromtheListingbaseplusthehost'sownsituationsandwhereitlearnsfrom. Labelledaconceptinthebuild.
			- **Calendar** · nightsandpriceskeptinsidetheproperty.
			- **Guestexperience** · placeholderoutofscope.
			- **Operations** · placeholderoutofscope.
			- **SmartListings** › StrategyPerformanceshownwhenit'son. Strategylistseachchannel'sstrategy; Performancecompareseachchannelwiththesamestretchbeforeitsstrategystarted.
		- **Channels** · onlytheconnectedones
			- **AirbnbBooking.comDirect**, each› ListingPricingAvailabilityBookingpoliciesthechannel'sownversionofeachpage. EveryfieldshowswhichoffourcasesitisusestheBasecustomonlyonthatchannelorsetbythechannel.
	</column>
</columns>
Achannel'sListinghastwoviewsClassicandCanvasandHostaway'sfivetabsEssentialsArrivalLocationAmenitiesRules.
## Outsidethemenu
<tableheader-row=true>
	<tr>
		<td>Flow</td>
		<td>Opensfrom</td>
		<td>Whatitholds</td>
	</tr>
	<tr>
		<td>**Strategywizard** (fullscreen)</td>
		<td>TheOverview'sSmartListingsswitchthefirsttime; Strategy› AddEditorReplace</td>
		<td>Channels→ onestrategyoroneeach→ goal→ whotoattract→ guardrails→ Autopilot→ anythingelsethestrategyshouldknow. Thequestionsrepeatforeachstrategy.</td>
	</tr>
	<tr>
		<td>**Booking-policyflow** (fullscreen)</td>
		<td>Channels› AirbnborDirect› Bookingpolicies› Configure</td>
		<td>Cancellationpolicy→ non-refundableoption(Airbnb) → review; Airbnb'slong-termstays→ review. Booking.comsetscancellationinitsExtranetsoitspageisread-only.</td>
	</tr>
</table>
LinksfromearlierbuildsredirecttheoldSetuppageopensthestrategywizardandoldversionpagesopenPerformance.
## Theglobalsidebar
Hostaway'sownreplicatedSearchGettingstartedHomeInboxPropertiesCalendarGuestexperienceMetricsDirectbookingsDevicesOperations. Only**Properties** navigatesstraighttotheproperty. Therestisshownbutinertbecausethecasedoesn'trebuildthoseareas. Onphonesthepropertymenubecomesasectionbarthatopensthewholemenuinabottomsheet. → <mention-pageurl=https//app.notion.comp3eee18af164581daa8b7f210cb1c6f4e>Mobile& tablet</mention-page>
## Howitwasmade
Readfromtheprototype'scode(thepropertylayoutanditsroutes) andcheckedagainstthelivesite. Whythemenuhasthisshape<mention-pageurl=https//app.notion.comp3eee18af16458180a645fc510d470034>Navigationoptions</mention-page>.
---
**Buildson**
- <mention-pageurl=https//app.notion.comp3eee18af16458180a645fc510d470034>Navigationoptions</mention-page>
- <mention-pageurl=https//app.notion.comp3eee18af16458168b8ede129bf1dc3a9>Objectmodel</mention-page>
**Feeds**
- <mention-pageurl=https//app.notion.comp3eee18af1645814595defdaab694e87d>Treetesting</mention-page>
- <mention-pageurl=https//app.notion.comp3eee18af1645818496f9d13c2481a86d>Userflows</mention-page>
- <mention-pageurl=https//app.notion.comp3eee18af164581828521eb27e3e50737>Solutionoverview</mention-page>
**Decisions**
- <mention-pageurl=https//app.notion.comp3eee18af164581f59e84e075de884cde>KD-03</mention-page>
- <mention-pageurl=https//app.notion.comp3eee18af1645819d96d4cff8530e1600>KD-05</mention-page>
- <mention-pageurl=https//app.notion.comp3eee18af164581028d64c3d0ff9f7d48>KD-06</mention-page>
- <mention-pageurl=https//app.notion.comp3eee18af164581ca9016ce7928ea3008>KD-16</mention-page>
**Intheprototype**
- [PropertyOverview]
- [Strategywizard]
- <mention-pageurl=https//app.notion.comp3eee18af164581178debffa0628f4703>Listingbase& channels</mention-page>
