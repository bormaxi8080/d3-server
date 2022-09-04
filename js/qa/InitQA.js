var InitQA = function() {
    context.qa_manager = new QAManager(new QADataStorageTweak(context));

    context.qa_manager.add_handler("command_time_is_valid", CommandTimeIsValidQA);
    context.qa_manager.add_handler("map_case_info_list", MapCaseInfoListQA);
    context.qa_manager.add_handler("scene_info_list", SceneInfoListQA);
    context.qa_manager.add_handler("clue_info_list", ClueInfoListQA);
    context.qa_manager.add_handler("lab_item_info_list", LabItemInfoListQA);
    context.qa_manager.add_handler("lab_item_info", LabItemInfoQA);
    context.qa_manager.add_handler("suspect_sign_info_list", SuspectSignInfoListQA);
    context.qa_manager.add_handler("suspect_info_list", SuspectInfoListQA);
    context.qa_manager.add_handler("sign_info_list", SignInfoListQA);
    context.qa_manager.add_handler("case_info", CaseInfoQA);
    context.qa_manager.add_handler("available_action_info_list", AvailableActionInfoListQA);
    context.qa_manager.add_handler("shop_item_list", ShopItemListQA);
    context.qa_manager.add_handler("booster_list", BoosterListQA);
    context.qa_manager.add_handler("energy_item_list", EnergyItemListQA);
    context.qa_manager.add_handler("energy_increment_count", EnergyIncrementCountQA);

    context.qa_manager.add_handler("lab_item_state", LabItemStateQA);
    context.qa_manager.add_handler("lab_item_progress", LabItemProgressQA);
    context.qa_manager.add_handler("lab_item_type", LabItemTypeQA);
    context.qa_manager.add_handler("lab_item_state_button_title", LabItemStateButtonTitleQA);
    context.qa_manager.add_handler("lab_item_state_button_color", LabItemStateButtonColorQA);
    context.qa_manager.add_handler("lab_item_character_img", LabItemCharacterImgQA);
    context.qa_manager.add_handler("lab_item_character_text", LabItemCharacterTextQA);
    context.qa_manager.add_handler("lab_item_tip_text", LabItemTipTextQA);
    context.qa_manager.add_handler("lab_item_remaining_time_text", LabItemRemainingTimeTextQA);
    context.qa_manager.add_handler("lab_item_remaining_time_list", LabItemRemainingTimeListQA);

    context.qa_manager.add_handler("active_scene_item_info_list", ActiveSceneItemInfoListQA);
    context.qa_manager.add_handler("active_scene_item_count", ActiveSceneItemCountQA);
    context.qa_manager.add_handler("active_scene_info", ActiveSceneInfoQA);
    context.qa_manager.add_handler("scene_special_item_available", SceneSpecialItemAvailableQA);
    context.qa_manager.add_handler("unfinished_scene_info", UnfinishedSceneInfoQA);
    context.qa_manager.add_handler("has_unfinished_scene", HasUnfinishedSceneQA);
    context.qa_manager.add_handler("has_unfinished_minigame", HasUnfinishedMinigameQA);

    context.qa_manager.add_handler("suspect_state_property", SuspectStatePropertyQA);
    context.qa_manager.add_handler("suspect_property", SuspectPropertyQA);
    context.qa_manager.add_handler("suspect_custom_properties", SuspectCustomPropertiesQA);
    context.qa_manager.add_handler("suspect_format_clues", SuspectFormatCluesQA);

    context.qa_manager.add_handler("tutorial_current_state", TutorialCurrentStateQA);
    context.qa_manager.add_handler("tutorial_steps", TutorialStepsQA);

    context.qa_manager.add_handler("partner_list", PartnerListQA);
    context.qa_manager.add_handler("fake_partners_list", FakePartnersListQA);
    context.qa_manager.add_handler("unlock_case_info", UnlockCaseInfoQA);

    context.qa_manager.add_handler("message_list", MessageListQA);
    context.qa_manager.add_handler("reject_services_list", RejectedServicesListQA);
    context.qa_manager.add_handler("local_push_notifications", LocalPushNotificationsQA);
    context.qa_manager.add_handler("player_data_json", PlayerDataJSONQA);
};
