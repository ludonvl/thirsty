<?php

namespace App\Http\Controllers;

use App\Models\Drink;
use App\Models\DrinkList;
use App\Models\DrinkType;
use App\Models\Group;
use App\Models\Menu;
use App\Services\QrcodeGenerate;
use Illuminate\Support\Facades\Auth;

class PageController extends Controller
{
    /**
     * Create a new controller instance.
     *
     * @return void
     */
    public function __construct()
    {
        $this->middleware('auth');
    }

    /**
     * Display all the static pages when authenticated
     *
     * @param string $page
     * @return \Illuminate\View\View
     */
    public function index(string $page)
    {
        if (view()->exists("pages.{$page}")) {
            $id = Auth::id();
            $data = null;

            if ($page === 'qrcode') {
                $menu = Menu::where('user_id', $id)->first();
                $qrcode = (new QrcodeGenerate())->setListId($menu->getKey())->generate();

                $data = compact('qrcode');
            } else if ($page === 'drinks') {
                $groups = Group::whereHas('menu', function($query) use ($id) {
                    return $query->where('user_id', $id);
                })->get();
                $groupsAndDrinks = Group::with('drinks')->whereHas('menu', function($query) use ($id) {
                    return $query->where('user_id', $id);
                })->get();

                $data = compact('groups', 'groupsAndDrinks');
            }

            return view("pages.{$page}", ['data' => $data]);
        }

        return abort(404);
    }
}
