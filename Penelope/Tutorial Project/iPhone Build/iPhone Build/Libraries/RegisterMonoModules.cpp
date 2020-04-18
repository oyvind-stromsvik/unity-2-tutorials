#include "RegisterMonoModules.h"
#ifdef __cplusplus
extern "C" {
#endif
	typedef void* gpointer;
	typedef int gboolean;
	const char*			UnityIPhoneRuntimeVersion = "1.6.0f1";
	void				mono_aot_register_module(gpointer *aot_info);
	void				mono_dl_register_symbol (const char* name, void *addr);
	extern gboolean		mono_aot_only;
	extern int 			mono_ficall_flag;
	extern gpointer*	mono_aot_module_Boo_Lang_info; // Boo.Lang.dll
	extern gpointer*	mono_aot_module_UnityScript_Lang_info; // UnityScript.Lang.dll
	extern gpointer*	mono_aot_module_mscorlib_info; // mscorlib.dll
	extern gpointer*	mono_aot_module_UnityEngine_info; // UnityEngine.dll
	extern gpointer*	mono_aot_module_7056d091db25b46b99f32f2a9ee244c9_info; // Assembly - UnityScript.dll
#ifdef __cplusplus
}
#endif
void RegisterMonoModules()
{
	mono_aot_only = true;
	mono_ficall_flag = false;
	mono_aot_register_module(mono_aot_module_Boo_Lang_info);
	mono_aot_register_module(mono_aot_module_UnityScript_Lang_info);
	mono_aot_register_module(mono_aot_module_mscorlib_info);
	mono_aot_register_module(mono_aot_module_UnityEngine_info);
	mono_aot_register_module(mono_aot_module_7056d091db25b46b99f32f2a9ee244c9_info);
}
